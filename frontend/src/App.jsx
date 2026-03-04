import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RulesProvider } from './context/RulesContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import CrewDashboard from './pages/CrewDashboard';
import SchedulerDashboard from './pages/SchedulerDashboard';
import FlightManagement from './pages/FlightManagement';
import CrewManagement from './pages/CrewManagement';
import RulesManagement from './pages/RulesManagement';
import ReportsPage from './pages/ReportsPage';
import ConflictViewer from './pages/ConflictViewer';
import AvailabilityManagement from './pages/AvailabilityManagement';
import LiveFlightBoard from './pages/LiveFlightBoard';
import NotificationsPage from './pages/NotificationsPage';
import AdminInbox from './pages/AdminInbox';

const PrivateRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(14,165,233,0.2)', borderTopColor: '#0ea5e9', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ color: '#475569', fontSize: '13px', fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em' }}>INITIALIZING...</p>
            </div>
        </div>
    );
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route path="/" element={
                        <PrivateRoute>
                            <RulesProvider>
                                <Layout />
                            </RulesProvider>
                        </PrivateRoute>
                    }>
                        <Route index element={<AuthRouteWrapper />} />
                        <Route path="dashboard" element={<AuthRouteWrapper />} />
                        <Route path="flights" element={<FlightManagement />} />
                        <Route path="crew" element={<CrewManagement />} />
                        <Route path="rules" element={<RulesManagement />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="generate" element={<SchedulerDashboard />} />
                        <Route path="conflicts" element={<ConflictViewer />} />
                        <Route path="availability" element={<AvailabilityManagement />} />
                        <Route path="live-board" element={<LiveFlightBoard />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="inbox" element={<AdminInbox />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

const AuthRouteWrapper = () => {
    const { user } = useAuth();
    if (user?.role === 'admin') return <AdminDashboard />;
    if (user?.role === 'scheduler') return <Navigate to="/generate" />;
    if (user?.role === 'crew') return <CrewDashboard />;
    return <Navigate to="/login" />;
};

export default App;

