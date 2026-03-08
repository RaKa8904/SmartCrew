import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace this with your machine's local network IP for device testing.
// Run `ipconfig` on Windows or `ifconfig` or `hostname -I` on Linux/mac 
// to find your LAN IP (e.g., 192.168.1.X).
// 'localhost' or '127.0.0.1' will NOT work on a physical Android device.
const BASE_URL = 'http://192.168.0.106:5000/api'; // Your LAN IP

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
});

// Automatically attach JWT to every request
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401s globally (token expired)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default api;
