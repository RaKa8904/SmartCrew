import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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

const PrivateRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-primary-500 font-bold">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route path="/" element={
                        <PrivateRoute>
                            <Layout />
                        </PrivateRoute>
                    }>
                        <Route index element={<Navigate to="/dashboard" />} />
                        <Route path="dashboard" element={<AuthRouteWrapper />} />
                        <Route path="flights" element={<FlightManagement />} />
                        <Route path="crew" element={<CrewManagement />} />
                        <Route path="rules" element={<RulesManagement />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="generate" element={<SchedulerDashboard />} />
                        <Route path="conflicts" element={<ConflictViewer />} />
                        <Route path="availability" element={<AvailabilityManagement />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

const AuthRouteWrapper = () => {
    const { user } = useAuth();
    if (user?.role === 'admin') return <AdminDashboard />;
    if (user?.role === 'scheduler') return <SchedulerDashboard />;
    if (user?.role === 'crew') return <CrewDashboard />;
    return <Navigate to="/login" />;
};

export default App;
