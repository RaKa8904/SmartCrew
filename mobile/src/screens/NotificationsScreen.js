import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react-native';
import api from '../services/api';
import { colors, fonts, spacing } from '../theme';

const ICON_MAP = {
    info: { icon: Info, color: colors.primary },
    warning: { icon: AlertTriangle, color: colors.warning },
    success: { icon: CheckCircle, color: colors.success },
};

const NotificationItem = ({ notification, onMarkRead }) => {
    const meta = ICON_MAP[notification.type] || ICON_MAP.info;
    const IconComp = meta.icon;
    const timeAgo = getTimeAgo(new Date(notification.createdAt));

    return (
        <TouchableOpacity
            style={[styles.notifCard, !notification.read && styles.notifUnread]}
            onPress={() => !notification.read && onMarkRead(notification.id)}
            activeOpacity={0.7}
        >
            <View style={[styles.notifIcon, { backgroundColor: meta.color + '15', borderColor: meta.color + '30' }]}>
                <IconComp size={16} color={meta.color} />
            </View>
            <View style={styles.notifContent}>
                <Text style={styles.notifMessage}>{notification.message}</Text>
                <View style={styles.notifMeta}>
                    <Clock size={10} color={colors.textMuted} />
                    <Text style={styles.notifTime}>{timeAgo}</Text>
                    {!notification.read && <View style={styles.unreadDot} />}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

const NotificationsScreen = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifs = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchNotifs(); }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifs();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    };

    if (loading) {
        return (
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </LinearGradient>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLabel}>
                    <Bell size={14} color={colors.primary} />
                    <Text style={fonts.label}>ALERTS</Text>
                </View>
                <Text style={fonts.heading}>Notifications</Text>
                <Text style={styles.subtext}>{unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}</Text>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <NotificationItem notification={item} onMarkRead={markAsRead} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Bell size={40} color={colors.textMuted} />
                        <Text style={styles.emptyText}>All clear!</Text>
                        <Text style={styles.emptySubtext}>No notifications to display.</Text>
                    </View>
                }
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md },
    headerLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    subtext: { ...fonts.small, marginTop: 2 },
    listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },

    notifCard: {
        flexDirection: 'row', alignItems: 'flex-start',
        backgroundColor: colors.card, borderRadius: 12,
        padding: spacing.md, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.cardBorder,
    },
    notifUnread: { borderLeftWidth: 3, borderLeftColor: colors.primary },
    notifIcon: {
        width: 36, height: 36, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
        marginRight: spacing.sm, borderWidth: 1,
    },
    notifContent: { flex: 1 },
    notifMessage: { color: colors.text, fontSize: 13, lineHeight: 18 },
    notifMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    notifTime: { fontSize: 10, color: colors.textMuted },
    unreadDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginLeft: 4 },

    emptyState: { alignItems: 'center', marginTop: 80, opacity: 0.5 },
    emptyText: { color: colors.textMuted, fontSize: 16, fontWeight: '600', marginTop: spacing.md },
    emptySubtext: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});

export default NotificationsScreen;
