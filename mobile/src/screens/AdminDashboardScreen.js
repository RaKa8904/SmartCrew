import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plane, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme';

const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    activeFlights: 0,
    delayedFlights: 0,
    availableCrew: 0,
    pendingRequests: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // In a real app, this would hit an admin dashboard summary endpoint
      // For now, let's fetch flights and approximate
      const flightsRes = await api.get('/flights');
      const flights = flightsRes.data;
      
      const active = flights.filter(f => f.status === 'on-time').length;
      const delayed = flights.filter(f => f.status === 'delayed').length;
      
      setStats({
        activeFlights: active,
        delayedFlights: delayed,
        availableCrew: 12, // Dummy value until we fetch real crew stats
        pendingRequests: 3, // Dummy value
      });
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>AOCC Dashboard</Text>
          <Text style={styles.subtitle}>System Overview & Active Metrics</Text>
        </View>

        <View style={styles.grid}>
          {/* Active Flights Card */}
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('Operations')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
              <Plane color="#38bdf8" size={24} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardValue}>{stats.activeFlights}</Text>
              <Text style={styles.cardLabel}>Active Flights</Text>
            </View>
          </TouchableOpacity>

          {/* Delayed Flights Card */}
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('Operations')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <AlertTriangle color="#ef4444" size={24} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardValue}>{stats.delayedFlights}</Text>
              <Text style={styles.cardLabel}>Delayed</Text>
            </View>
          </TouchableOpacity>

          {/* Crew Available */}
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('Crew')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
              <Users color="#22c55e" size={24} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardValue}>{stats.availableCrew}</Text>
              <Text style={styles.cardLabel}>Crew Available</Text>
            </View>
          </TouchableOpacity>

          {/* Pending Requests */}
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('Requests')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Clock color="#f59e0b" size={24} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardValue}>{stats.pendingRequests}</Text>
              <Text style={styles.cardLabel}>Pending Requests</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent System Alerts</Text>
          <View style={styles.alertCard}>
            <AlertTriangle color="#f59e0b" size={20} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Crew Shortage: EK102</Text>
              <Text style={styles.alertTime}>10 minutes ago</Text>
            </View>
          </View>
          <View style={styles.alertCard}>
            <AlertTriangle color="#ef4444" size={20} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Flight Cancelled: SQ402</Text>
              <Text style={styles.alertTime}>1 hour ago</Text>
            </View>
          </View>
          <View style={styles.alertCardSuccess}>
            <CheckCircle color="#22c55e" size={20} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Schedule Auto-Generated</Text>
              <Text style={styles.alertTime}>2 hours ago</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardContent: {},
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertCardSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  alertTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});

export default AdminDashboardScreen;
