import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings2, Filter, AlertCircle, CheckCircle, Clock } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme';

const AdminOperationsScreen = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFlights = async () => {
        try {
            setLoading(true);
            const res = await api.get('/flights');
            setFlights(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlights();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'on-time': return <CheckCircle size={16} color="#10b981" />;
            case 'delayed': return <AlertCircle size={16} color="#f59e0b" />;
            case 'cancelled': return <AlertCircle size={16} color="#ef4444" />;
            default: return <Clock size={16} color={colors.textMuted} />;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'on-time': return { color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' };
            case 'delayed': return { color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)' };
            case 'cancelled': return { color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' };
            default: return { color: colors.textMuted, backgroundColor: 'rgba(255,255,255,0.05)' };
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.flightNumber}>{item.flightNumber}</Text>
                    <Text style={styles.route}>{item.origin} → {item.destination}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(item.status).backgroundColor }]}>
                    {getStatusIcon(item.status)}
                    <Text style={[styles.statusText, { color: getStatusStyle(item.status).color }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Departs</Text>
                    <Text style={styles.infoValue}>
                        {new Date(item.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Gate</Text>
                    <Text style={styles.infoValue}>{item.gate || 'TBD'}</Text>
                </View>
                <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Aircraft</Text>
                    <Text style={styles.infoValue}>{item.aircraftType?.split(' ')[1] || item.aircraftType}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Flight Operations</Text>
                    <Text style={styles.subtitle}>Active Network Status</Text>
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={flights}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchFlights} tintColor={colors.primary} />}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No flights found.</Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: 4,
    },
    filterBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    flightNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    route: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: colors.cardBorder,
        marginVertical: 12,
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoCol: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: colors.textMuted,
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: 16,
    },
});

export default AdminOperationsScreen;
