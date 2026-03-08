import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const DEMO_CREDS = [
    { role: 'Admin', email: 'admin@airline.com', pw: 'password123', color: '#f59e0b' },
    { role: 'Scheduler', email: 'scheduler@airline.com', pw: 'password123', color: '#0ea5e9' },
    { role: 'Pilot', email: 'pilot1@airline.com', pw: 'password123', color: '#a78bfa' },
    { role: 'Cabin', email: 'cabin1@airline.com', pw: 'password123', color: '#34d399' },
];

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Check email and password.');
        } finally {
            setLoading(false);
        }
    };

    const quickFill = (cred) => { setEmail(cred.email); setPassword(cred.pw); };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
            style={{ background: '#020617' }}>

            {/* Animated aviation background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Grid */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(14, 165, 233, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.04) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />
                {/* Glows */}
                <div className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)' }} />
                <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%)' }} />
                {/* Runway lines */}
                {[...Array(8)].map((_, i) => (
                    <div key={i}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2"
                        style={{
                            width: '4px', height: '40px',
                            background: 'rgba(245, 158, 11, 0.4)',
                            bottom: `${10 + i * 60}px`,
                            borderRadius: '2px',
                            opacity: 1 - i * 0.1,
                        }} />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                        style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', boxShadow: '0 0 40px rgba(14, 165, 233, 0.4)' }}
                    >
                        <Plane className="text-white" size={30} />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">SmartCrew Portal</h1>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span style={{ width: '24px', height: '1px', background: 'rgba(14,165,233,0.4)' }} />
                        <p className="hud-label">AVIATION OPERATIONS CENTER</p>
                        <span style={{ width: '24px', height: '1px', background: 'rgba(14,165,233,0.4)' }} />
                    </div>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8 shadow-2xl" style={{ boxShadow: '0 0 60px rgba(14, 165, 233, 0.08)' }}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold mb-2 hud-label">EMAIL ADDRESS</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10" size={16} style={{ color: '#334155' }} />
                                <input
                                    type="email" value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="avio-input leading-tight"
                                    style={{ paddingLeft: '2.75rem' }}
                                    placeholder="name@airline.com" required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-2 hud-label">PASSWORD</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10" size={16} style={{ color: '#334155' }} />
                                <input
                                    type="password" value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="avio-input leading-tight"
                                    style={{ paddingLeft: '2.75rem' }}
                                    placeholder="••••••••" required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="glass-button w-full py-3.5 justify-center text-base">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>Authorization Clearance <ArrowRight size={18} className="ml-1" /></>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm" style={{ color: '#475569' }}>
                        New crew member?{' '}
                        <Link to="/register" className="font-semibold transition-colors" style={{ color: '#0ea5e9' }}>
                            Request Access
                        </Link>
                    </p>
                </div>

                {/* Quick access demo panel */}
                <div className="mt-4 glass-card p-4" style={{ border: '1px solid rgba(245,158,11,0.15)' }}>
                    <p className="hud-label text-center mb-3" style={{ color: '#b45309' }}>⚡ DEMO QUICK ACCESS</p>
                    <div className="grid grid-cols-2 gap-2">
                        {DEMO_CREDS.map(cred => (
                            <button key={cred.role} onClick={() => quickFill(cred)}
                                className="text-left p-3 rounded-xl transition-all"
                                style={{ background: `${cred.color}10`, border: `1px solid ${cred.color}25` }}
                                onMouseEnter={e => e.currentTarget.style.border = `1px solid ${cred.color}50`}
                                onMouseLeave={e => e.currentTarget.style.border = `1px solid ${cred.color}25`}
                            >
                                <p className="text-xs font-bold" style={{ color: cred.color }}>{cred.role}</p>
                                <p className="text-xs mt-0.5 truncate" style={{ color: '#64748b' }}>{cred.email}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
