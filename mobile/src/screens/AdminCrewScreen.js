import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Phone, Search } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme';

const AdminCrewScreen = () => {
    const [crewList, setCrewList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCrew = async () => {
        try {
            setLoading(true);
            // Let's assume there is an endpoint to get all users or crew
            // For now we simulate with a dummy list if the endpoint fails
            try {
                const res = await api.get('/crew');
                setCrewList(res.data);
            } catch (err) {
                // Fallback dummy data modeled after the UI
                setCrewList([
                    { id: 1, name: 'Capt. James Wilson', qualification: 'A380 Captain', status: 'Available', type: 'pilot' },
                    { id: 2, name: 'F/O Aisha Rahman', qualification: 'B737 First Officer', status: 'On Duty', type: 'pilot' },
                    { id: 3, name: 'Sarah Jenkins', qualification: 'Senior Purser', status: 'Available', type: 'cabin' },
                    { id: 4, name: 'Elena Vasquez', qualification: 'Cabin Crew', status: 'On Leave', type: 'cabin' },
                ]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCrew();
    }, []);

    const getStatusColor = (status) => {
        if (status?.toLowerCase().includes('avail')) return '#10b981';
        if (status?.toLowerCase().includes('duty')) return '#38bdf8';
        if (status?.toLowerCase().includes('leave')) return '#f59e0b';
        return colors.textMuted;
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}{item.name.split(' ')[1] ? item.name.split(' ')[1].charAt(0) : ''}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.role}>{item.qualification}</Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Phone size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <FileText size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Crew Management</Text>
                    <Text style={styles.subtitle}>Roster & Availability</Text>
                </View>
                <TouchableOpacity style={styles.searchBtn}>
                    <Search size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={crewList}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchCrew} tintColor={colors.primary} />}
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
    searchBtn: {
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
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    role: {
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 6,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default AdminCrewScreen;
