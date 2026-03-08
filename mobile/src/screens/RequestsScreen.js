import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Hand, CalendarClock, Plus, X, Check } from 'lucide-react-native';
import api from '../services/api';
import { colors, fonts, spacing } from '../theme';

const RequestCard = ({ item, type }) => {
    const isLeave = type === 'leave';
    const statusColor = item.status === 'approved' ? colors.success : item.status === 'rejected' ? colors.danger : colors.warning;

    return (
        <View style={styles.card}>
            <View style={[styles.statusStrip, { backgroundColor: statusColor }]} />
            <View style={styles.cardInner}>
                <View style={styles.cardHeader}>
                    <Text style={styles.typeText}>{isLeave ? 'Leave Request' : 'Swap Request'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '40' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>
                {isLeave ? (
                    <>
                        <Text style={styles.detailText}>From: {new Date(item.startDate).toLocaleDateString()}</Text>
                        <Text style={styles.detailText}>To: {new Date(item.endDate).toLocaleDateString()}</Text>
                        {item.reason ? <Text style={styles.reasonText}>"{item.reason}"</Text> : null}
                    </>
                ) : (
                    <>
                        <Text style={styles.detailText}>Schedule ID: {item.scheduleId}</Text>
                        <Text style={styles.detailText}>Sent to: {item.targetUser?.name || 'Open Board'}</Text>
                        <Text style={styles.reasonText}>Flight: {item.schedule?.flight?.flightNumber || 'N/A'}</Text>
                    </>
                )}
            </View>
        </View>
    );
};

const RequestsScreen = () => {
    const [leaves, setLeaves] = useState([]);
    const [swaps, setSwaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('leave'); // 'leave' or 'swap'
    const [modalVisible, setModalVisible] = useState(false);
    const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
    const [swapForm, setSwapForm] = useState({ scheduleId: null, targetUserId: '' });
    const [mySchedules, setMySchedules] = useState([]);

    const fetchRequests = async () => {
        try {
            const [leaveRes, swapRes, schedRes] = await Promise.all([
                api.get('/portal/leave/my-requests'),
                api.get('/portal/swap/my-requests'),
                api.get('/crew/me')
            ]);
            setLeaves(leaveRes.data);
            setSwaps(swapRes.data);

            // Only keep future flights for swapping
            const futureSchedules = (schedRes.data?.schedules || []).filter(
                s => new Date(s.flight.departureTime) > new Date()
            );
            setMySchedules(futureSchedules);
        } catch (err) {
            console.error('Failed to fetch requests', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchRequests();
    }, []);

    const handleSubmitLeave = async () => {
        if (!leaveForm.startDate || !leaveForm.endDate) {
            Alert.alert('Error', 'Start Date and End Date are required (YYYY-MM-DD)');
            return;
        }
        try {
            await api.post('/portal/leave', leaveForm);
            Alert.alert('Success', 'Leave request submitted.');
            setModalVisible(false);
            setLeaveForm({ startDate: '', endDate: '', reason: '' });
            onRefresh();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit request');
        }
    };

    const handleSubmitSwap = async () => {
        if (!swapForm.scheduleId) {
            Alert.alert('Error', 'Please enter the Schedule ID you want to swap.');
            return;
        }
        try {
            // Optional target user, cast to numbers
            const payload = {
                scheduleId: parseInt(swapForm.scheduleId),
                ...(swapForm.targetUserId ? { targetUserId: parseInt(swapForm.targetUserId) } : {})
            };
            await api.post('/portal/swap', payload);
            Alert.alert('Success', 'Shift swap request created!');
            setModalVisible(false);
            setSwapForm({ scheduleId: null, targetUserId: '' });
            onRefresh();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create swap request');
        }
    };

    const activeData = activeTab === 'leave' ? leaves : swaps;

    if (loading) {
        return (
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLabel}>
                    <Hand size={14} color={colors.primary} />
                    <Text style={fonts.label}>SELF-SERVICE</Text>
                </View>
                <Text style={fonts.heading}>My Requests</Text>
            </View>

            {/* Segmented Control */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'leave' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('leave')}
                >
                    <Text style={[styles.tabText, activeTab === 'leave' && styles.tabTextActive]}>Leave</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'swap' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('swap')}
                >
                    <Text style={[styles.tabText, activeTab === 'swap' && styles.tabTextActive]}>Swaps</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={activeData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <RequestCard item={item} type={activeTab} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <CalendarClock size={40} color={colors.textMuted} />
                        <Text style={styles.emptyText}>No {activeTab} requests found.</Text>
                    </View>
                }
            />

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Plus size={24} color="#fff" />
            </TouchableOpacity>

            {/* Create Request Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New {activeTab === 'leave' ? 'Leave' : 'Swap'} Request</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {activeTab === 'leave' ? (
                            <View style={styles.form}>
                                <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 2026-03-25"
                                    placeholderTextColor={colors.textMuted}
                                    value={leaveForm.startDate}
                                    onChangeText={(t) => setLeaveForm({ ...leaveForm, startDate: t })}
                                />
                                <Text style={styles.inputLabel}>End Date (YYYY-MM-DD)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 2026-03-28"
                                    placeholderTextColor={colors.textMuted}
                                    value={leaveForm.endDate}
                                    onChangeText={(t) => setLeaveForm({ ...leaveForm, endDate: t })}
                                />
                                <Text style={styles.inputLabel}>Reason (Optional)</Text>
                                <TextInput
                                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                    placeholder="Reason for leave"
                                    placeholderTextColor={colors.textMuted}
                                    multiline
                                    value={leaveForm.reason}
                                    onChangeText={(t) => setLeaveForm({ ...leaveForm, reason: t })}
                                />
                                <TouchableOpacity style={styles.submitButton} onPress={handleSubmitLeave}>
                                    <Text style={styles.submitButtonText}>Submit Leave Request</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.form}>
                                <Text style={styles.inputLabel}>Select Flight to Swap</Text>
                                <ScrollView style={{ maxHeight: 150, marginBottom: spacing.md }} showsVerticalScrollIndicator={false}>
                                    {mySchedules.length === 0 ? (
                                        <Text style={styles.emptyText}>No upcoming flights available to swap.</Text>
                                    ) : (
                                        mySchedules.map((sched) => (
                                            <TouchableOpacity
                                                key={sched.id}
                                                style={[styles.schedSelect, swapForm.scheduleId === sched.id && styles.schedSelectActive]}
                                                onPress={() => setSwapForm({ ...swapForm, scheduleId: sched.id })}
                                            >
                                                <View>
                                                    <Text style={{ ...fonts.body, color: swapForm.scheduleId === sched.id ? colors.primary : colors.text }}>
                                                        {sched.flight.flightNumber} ({sched.flight.origin} - {sched.flight.destination})
                                                    </Text>
                                                    <Text style={{ ...fonts.small, color: colors.textMuted }}>
                                                        {new Date(sched.flight.departureTime).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                                {swapForm.scheduleId === sched.id && <Check size={16} color={colors.primary} />}
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </ScrollView>

                                <Text style={styles.inputLabel}>Target User ID (Optional - Leave blank for Open Board)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 7"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    value={swapForm.targetUserId ? String(swapForm.targetUserId) : ''}
                                    onChangeText={(t) => setSwapForm({ ...swapForm, targetUserId: t })}
                                />

                                <TouchableOpacity style={styles.submitButton} onPress={handleSubmitSwap}>
                                    <Text style={styles.submitButtonText}>Submit Swap Request</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.sm },
    headerLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },

    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        alignItems: 'center',
    },
    tabButtonActive: {
        backgroundColor: colors.primary + '20',
        borderColor: colors.primary,
    },
    tabText: { ...fonts.body, color: colors.textDim },
    tabTextActive: { ...fonts.body, color: colors.primary, fontWeight: '700' },

    card: {
        backgroundColor: colors.card,
        borderRadius: 12, marginBottom: spacing.md,
        borderWidth: 1, borderColor: colors.cardBorder,
        flexDirection: 'row', overflow: 'hidden',
    },
    statusStrip: { width: 4 },
    cardInner: { flex: 1, padding: spacing.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    typeText: { ...fonts.body, fontWeight: '700' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
    statusText: { fontSize: 10, fontWeight: '800' },
    detailText: { ...fonts.small, marginBottom: 2 },
    reasonText: { ...fonts.small, color: colors.textDim, fontStyle: 'italic', marginTop: 4 },

    emptyState: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
    emptyText: { color: colors.textMuted, fontSize: 16, marginTop: spacing.md },

    fab: {
        position: 'absolute', right: 20, bottom: 20,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
    },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: spacing.lg, minHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalTitle: { ...fonts.heading, fontSize: 20 },
    form: { gap: spacing.md },
    inputLabel: { ...fonts.small, color: colors.textDim, marginBottom: 4 },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1, borderColor: colors.cardBorder,
        borderRadius: 8, padding: 12,
        color: colors.text, ...fonts.body,
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: 8, padding: 16,
        alignItems: 'center', marginTop: spacing.sm,
    },
    submitButtonText: { color: '#fff', ...fonts.body, fontWeight: '700' },
    schedSelect: {
        padding: spacing.md, backgroundColor: colors.background,
        borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.cardBorder,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    schedSelectActive: {
        borderColor: colors.primary, backgroundColor: colors.primary + '10'
    }
});

export default RequestsScreen;
