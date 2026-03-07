import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDays, Plane, Clock, Users } from 'lucide-react-native';
import api from '../services/api';
import { colors, fonts, spacing } from '../theme';

const STATUS_COLORS = {
    'on-time': colors.success,
    delayed: colors.warning,
    cancelled: colors.danger,
};

const ScheduleCard = ({ schedule }) => {
    const flight = schedule.flight;
    if (!flight) return null;
    const dep = new Date(flight.departureTime);
    const arr = new Date(flight.arrivalTime);
    const durationHrs = ((arr - dep) / 3600000).toFixed(1);
    const statusColor = STATUS_COLORS[flight.status] || colors.textMuted;

    return (
        <View style={styles.card}>
            {/* Status Strip */}
            <View style={[styles.statusStrip, { backgroundColor: statusColor }]} />
            <View style={styles.cardInner}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '40' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {flight.status?.toUpperCase().replace('-', ' ')}
                        </Text>
                    </View>
                </View>

                {/* Route */}
                <View style={styles.routeRow}>
                    <View style={styles.routeEnd}>
                        <Text style={styles.iata}>{flight.origin}</Text>
                        <Text style={styles.time}>{dep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={styles.routeCenter}>
                        <View style={styles.routeLine}>
                            <View style={[styles.routeDash, { backgroundColor: colors.primaryBorder }]} />
                            <Plane size={14} color={colors.primary} style={{ transform: [{ rotate: '90deg' }] }} />
                            <View style={[styles.routeDash, { backgroundColor: colors.primaryBorder }]} />
                        </View>
                        <Text style={styles.duration}>{durationHrs}h</Text>
                    </View>
                    <View style={[styles.routeEnd, { alignItems: 'flex-end' }]}>
                        <Text style={styles.iata}>{flight.destination}</Text>
                        <Text style={styles.time}>{arr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                        <Plane size={12} color={colors.textDim} />
                        <Text style={styles.footerText}>{flight.aircraftType}</Text>
                    </View>
                    {flight.gate && (
                        <View style={styles.footerItem}>
                            <Text style={styles.footerText}>Gate {flight.gate}</Text>
                        </View>
                    )}
                    <View style={styles.footerItem}>
                        <Users size={12} color={colors.textDim} />
                        <Text style={styles.footerText}>{flight.schedules?.length || 0} crew</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const ScheduleScreen = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSchedules = async () => {
        try {
            const res = await api.get('/crew/me');
            setSchedules(res.data?.schedules || []);
        } catch (err) {
            console.error('Failed to fetch schedule', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchSchedules(); }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSchedules();
    }, []);

    if (loading) {
        return (
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLabel}>
                    <CalendarDays size={14} color={colors.primary} />
                    <Text style={fonts.label}>MY ROSTER</Text>
                </View>
                <Text style={fonts.heading}>My Schedule</Text>
                <Text style={styles.subtext}>{schedules.length} upcoming assignment{schedules.length !== 1 ? 's' : ''}</Text>
            </View>

            <FlatList
                data={schedules}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <ScheduleCard schedule={item} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Plane size={40} color={colors.textMuted} />
                        <Text style={styles.emptyText}>No assignments yet.</Text>
                        <Text style={styles.emptySubtext}>Your upcoming flights will appear here.</Text>
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

    card: {
        backgroundColor: colors.card,
        borderRadius: 16, marginBottom: spacing.md,
        borderWidth: 1, borderColor: colors.cardBorder,
        overflow: 'hidden', flexDirection: 'row',
    },
    statusStrip: { width: 4 },
    cardInner: { flex: 1, padding: spacing.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    flightNumber: { ...fonts.code, fontSize: 16, fontWeight: '800' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
    statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },

    routeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
    routeEnd: {},
    iata: { fontSize: 24, fontWeight: '800', color: colors.text, fontFamily: 'monospace' },
    time: { fontSize: 11, color: colors.textDim, marginTop: 2 },
    routeCenter: { flex: 1, alignItems: 'center', marginHorizontal: spacing.sm },
    routeLine: { flexDirection: 'row', alignItems: 'center', width: '100%' },
    routeDash: { flex: 1, height: 1 },
    duration: { fontSize: 11, color: colors.textDim, marginTop: 2 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: spacing.sm },
    footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerText: { ...fonts.small, fontSize: 11 },

    emptyState: { alignItems: 'center', marginTop: 80, opacity: 0.5 },
    emptyText: { color: colors.textMuted, fontSize: 16, fontWeight: '600', marginTop: spacing.md },
    emptySubtext: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});

export default ScheduleScreen;
