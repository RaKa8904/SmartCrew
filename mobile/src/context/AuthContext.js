import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from '../services/api';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from AsyncStorage on app start
    useEffect(() => {
        const loadStoredAuth = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                const storedUser = await AsyncStorage.getItem('user');
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                    await registerPushToken();
                }
            } catch (e) {
                console.error('Failed to load auth state', e);
            } finally {
                setLoading(false);
            }
        };
        loadStoredAuth();
    }, []);

    const registerPushToken = async () => {
        if (Constants.appOwnership === 'expo') {
            console.log('Push notifications are not supported in Expo Go. Skipping to prevent SDK 53 crash.');
            return;
        }

        let token;
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
            });
        }
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push API permission');
                return;
            }
            try {
                // If projectId is required but missing, getExpoPushTokenAsync might fail.
                const expoPushToken = await Notifications.getExpoPushTokenAsync({
                    projectId: Constants?.expoConfig?.extra?.eas?.projectId ?? undefined,
                });
                token = expoPushToken.data;
                console.log('Mobile Push Token:', token);
                await api.post('/notifications/push-token', { token });
            } catch (err) {
                console.log('Could not fetch push token:', err.message);
            }
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, user: newUser } = res.data;
        await AsyncStorage.setItem('token', newToken);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        await registerPushToken();
        return newUser;
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
