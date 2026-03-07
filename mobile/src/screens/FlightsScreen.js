import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Radio, Plane } from 'lucide-react-native';
import api from '../services/api';
import { colors, fonts, spacing } from '../theme';

const STATUS_COLORS = {
    'on-time': colors.success,
    delayed: colors.warning,
    cancelled: colors.danger,
};

const FlightRow = ({ flight }) => {
    const dep = new Date(flight.departureTime);
    const arr = new Date(flight.arrivalTime);
    const statusColor = STATUS_COLORS[flight.status] || colors.textMuted;

    return (
        <View style={styles.row}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={styles.cellTime}>{dep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            <Text style={styles.cellFlight}>{flight.flightNumber}</Text>
            <View style={styles.routeCell}>
                <Text style={styles.cellIata}>{flight.origin}</Text>
                <Plane size={10} color={colors.textDim} style={{ transform: [{ rotate: '90deg' }], marginHorizontal: 4 }} />
                <Text style={styles.cellIata}>{flight.destination}</Text>
            </View>
            <Text style={[styles.cellStatus, { color: statusColor }]}>
                {flight.status?.toUpperCase().replace('-', ' ')}
            </Text>
            <Text style={styles.cellGate}>{flight.gate || '—'}</Text>
        </View>
    );
};

const FlightsScreen = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFlights = async () => {
        try {
            const res = await api.get('/flights');
            const sorted = res.data.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
            setFlights(sorted);
        } catch (err) {
            console.error('Failed to fetch flights', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchFlights(); }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFlights();
    }, []);

    if (loading) {
        return (
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </LinearGradient>
        );
    }

    const onTimeCount = flights.filter(f => f.status === 'on-time').length;
    const delayedCount = flights.filter(f => f.status === 'delayed').length;

    return (
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLabel}>
                    <Radio size={14} color={colors.primary} />
                    <Text style={fonts.label}>LIVE FIDS</Text>
                </View>
                <Text style={fonts.heading}>Flight Board</Text>
                <View style={styles.statsRow}>
                    <Text style={[styles.statBadge, { color: colors.success }]}>✓ {onTimeCount} On Time</Text>
                    <Text style={[styles.statBadge, { color: colors.warning }]}>⚠ {delayedCount} Delayed</Text>
                    <Text style={[styles.statBadge, { color: colors.textDim }]}>{flights.length} Total</Text>
                </View>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.thText, { width: 8 }]}></Text>
                <Text style={[styles.thText, { width: 50 }]}>TIME</Text>
                <Text style={[styles.thText, { width: 60 }]}>FLIGHT</Text>
                <Text style={[styles.thText, { flex: 1 }]}>ROUTE</Text>
                <Text style={[styles.thText, { width: 70 }]}>STATUS</Text>
                <Text style={[styles.thText, { width: 40 }]}>GATE</Text>
            </View>

            <FlatList
                data={flights}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <FlightRow flight={item} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.sm },
    headerLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
    statBadge: { fontSize: 11, fontWeight: '600' },

    tableHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
        borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
        gap: spacing.sm,
    },
    thText: { ...fonts.label, fontSize: 9 },

    listContent: { paddingBottom: 100 },

    row: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: spacing.lg, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
        gap: spacing.sm,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    cellTime: { width: 50, fontFamily: 'monospace', fontSize: 12, color: colors.textSecondary },
    cellFlight: { width: 60, fontFamily: 'monospace', fontSize: 13, fontWeight: '700', color: colors.primary },
    routeCell: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    cellIata: { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', color: colors.text },
    cellStatus: { width: 70, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
    cellGate: { width: 40, fontSize: 11, color: colors.textDim, textAlign: 'right' },
});

export default FlightsScreen;
