import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, LogOut, Shield, Mail, Plane, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, spacing } from '../theme';

const ROLE_COLORS = {
    admin: '#f59e0b',
    scheduler: '#3b82f6',
    pilot: '#a855f7',
    cabin_crew: '#10b981',
};

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const roleColor = ROLE_COLORS[user?.role] || colors.primary;

    const handleLogout = () => {
        Alert.alert('Confirm Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: logout },
        ]);
    };

    return (
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
            <View style={styles.header}>
                <Text style={fonts.label}>PROFILE</Text>
                <Text style={fonts.heading}>My Account</Text>
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={[styles.avatar, { borderColor: roleColor }]}>
                    <Text style={styles.avatarText}>
                        {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.name}>{user?.name}</Text>
                <View style={[styles.roleBadge, { backgroundColor: roleColor + '20', borderColor: roleColor + '40' }]}>
                    <Text style={[styles.roleText, { color: roleColor }]}>{user?.role?.toUpperCase().replace('_', ' ')}</Text>
                </View>
            </View>

            {/* Info Cards */}
            <View style={styles.section}>
                <View style={styles.infoRow}>
                    <View style={styles.infoIcon}><Mail size={16} color={colors.primary} /></View>
                    <View>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoIcon}><Shield size={16} color={colors.primary} /></View>
                    <View>
                        <Text style={styles.infoLabel}>Role</Text>
                        <Text style={styles.infoValue}>{user?.role?.replace('_', ' ')}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoIcon}><Plane size={16} color={colors.primary} /></View>
                    <View>
                        <Text style={styles.infoLabel}>System</Text>
                        <Text style={styles.infoValue}>SmartCrew Aviation Ops</Text>
                    </View>
                </View>
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
                <LogOut size={18} color={colors.danger} />
                <Text style={styles.logoutText}>Sign Out</Text>
                <ChevronRight size={16} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md },

    profileCard: {
        alignItems: 'center', paddingVertical: spacing.xl,
        marginHorizontal: spacing.lg,
        backgroundColor: colors.card, borderRadius: 16,
        borderWidth: 1, borderColor: colors.cardBorder,
    },
    avatar: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, marginBottom: spacing.md,
    },
    avatarText: { fontSize: 24, fontWeight: '800', color: colors.text },
    name: { fontSize: 18, fontWeight: '700', color: colors.text },
    roleBadge: { marginTop: spacing.sm, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
    roleText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },

    section: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
    infoRow: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        backgroundColor: colors.card, borderRadius: 12,
        padding: spacing.md, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.cardBorder,
    },
    infoIcon: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: colors.primaryGlow,
        justifyContent: 'center', alignItems: 'center',
    },
    infoLabel: { ...fonts.label, fontSize: 9 },
    infoValue: { color: colors.text, fontSize: 14, fontWeight: '500', marginTop: 2 },

    logoutButton: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        marginHorizontal: spacing.lg, marginTop: spacing.xl,
        backgroundColor: colors.dangerGlow, borderRadius: 12,
        padding: spacing.md,
        borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    logoutText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
});

export default ProfileScreen;
