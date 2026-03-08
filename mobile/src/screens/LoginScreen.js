import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plane, Lock, Mail, Shield } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, spacing } from '../theme';

const LoginScreen = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Fields', 'Please enter both email and password.');
            return;
        }
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Network error. Please check if your backend is running or if the IP address in api.js has changed.';
            Alert.alert('Login Failed', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = (role) => {
        const creds = {
            admin: { email: 'admin@airline.com', password: 'password123' },
            scheduler: { email: 'scheduler@airline.com', password: 'password123' },
            pilot: { email: 'pilot1@airline.com', password: 'password123' },
            cabin: { email: 'cabin1@airline.com', password: 'password123' },
        };
        setEmail(creds[role].email);
        setPassword(creds[role].password);
    };

    return (
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Plane size={28} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>SmartCrew</Text>
                    <Text style={styles.subtitle}>AVIATION OPS CENTER</Text>
                </View>

                {/* Form */}
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Mail size={16} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor={colors.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Lock size={16} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Shield size={16} color="#fff" />
                                <Text style={styles.loginButtonText}>Authorization Clearance</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Quick Access */}
                <View style={styles.quickAccess}>
                    <Text style={styles.quickLabel}>QUICK ACCESS</Text>
                    <View style={styles.quickRow}>
                        {[
                            { key: 'admin', label: 'Admin', color: '#f59e0b' },
                            { key: 'scheduler', label: 'Scheduler', color: '#3b82f6' },
                            { key: 'pilot', label: 'Pilot', color: '#a855f7' },
                            { key: 'cabin', label: 'Cabin', color: '#10b981' },
                        ].map((r) => (
                            <TouchableOpacity
                                key={r.key}
                                style={[styles.quickButton, { borderColor: r.color + '40' }]}
                                onPress={() => quickLogin(r.key)}
                                activeOpacity={0.6}
                            >
                                <View style={[styles.quickDot, { backgroundColor: r.color }]} />
                                <Text style={[styles.quickButtonText, { color: r.color }]}>{r.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },

    logoContainer: { alignItems: 'center', marginBottom: spacing.xl },
    logoCircle: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: colors.primaryGlow,
        borderWidth: 1, borderColor: colors.primaryBorder,
        justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
    },
    title: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: 1 },
    subtitle: { ...fonts.label, marginTop: spacing.xs, color: colors.primary },

    formCard: {
        backgroundColor: colors.card,
        borderRadius: 16, padding: spacing.lg,
        borderWidth: 1, borderColor: colors.cardBorder,
    },
    inputGroup: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        borderRadius: 12, marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
        borderWidth: 1, borderColor: colors.cardBorder,
    },
    inputIcon: { marginRight: spacing.sm },
    input: {
        flex: 1, color: colors.text, fontSize: 14,
        paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    },

    loginButton: {
        backgroundColor: colors.primary,
        borderRadius: 12, paddingVertical: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, marginTop: spacing.sm,
    },
    loginButtonDisabled: { opacity: 0.6 },
    loginButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },

    quickAccess: { marginTop: spacing.xl, alignItems: 'center' },
    quickLabel: { ...fonts.label, marginBottom: spacing.md },
    quickRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
    quickButton: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    quickDot: { width: 6, height: 6, borderRadius: 3 },
    quickButtonText: { fontSize: 12, fontWeight: '700' },
});

export default LoginScreen;
