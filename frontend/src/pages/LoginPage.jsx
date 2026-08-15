import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEMO_CREDS = [
    { role: 'Admin', email: 'admin@airline.com', pw: 'password123', color: '#f59e0b' },
    { role: 'Scheduler', email: 'scheduler@airline.com', pw: 'password123', color: '#0ea5e9' },
    { role: 'Pilot', email: 'pilot1@airline.com', pw: 'password123', color: '#a78bfa' },
    { role: 'Cabin', email: 'cabin1@airline.com', pw: 'password123', color: '#34d399' },
];

// Detailed Boeing Airliner Silhouette SVG
const Boeing777SVG = () => (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_20px_rgba(14,165,233,0.8)]">
        <path
            d="M12 2C11.5 2 11 3.5 11 6V11L2 14.5V17L11 15V20L8.5 21.5V23L12 22L15.5 23V21.5L13 20V15L22 17V14.5L13 11V6C13 3.5 12.5 2 12 2Z"
            fill="#38bdf8"
            stroke="#e0f2fe"
            strokeWidth="0.5"
        />
    </svg>
);

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [takingOff, setTakingOff] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            setTakingOff(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 1400);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Check email and password.');
            setLoading(false);
            setTakingOff(false);
        }
    };

    const quickFill = (cred) => { setEmail(cred.email); setPassword(cred.pw); };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
            style={{ background: 'var(--bg-base)' }}>

            {/* Animated aviation background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Grid */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(var(--radar-color) 1px, transparent 1px), linear-gradient(90deg, var(--radar-color) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />
                {/* Glows */}
                <div className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, var(--electric-glow) 0%, transparent 70%)' }} />
                <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, var(--amber-glow) 0%, transparent 70%)' }} />
                {/* Runway center lines */}
                {[...Array(8)].map((_, i) => (
                    <div key={i}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2"
                        style={{
                            width: '4px', height: '40px',
                            background: 'var(--amber)',
                            bottom: `${10 + i * 60}px`,
                            borderRadius: '2px',
                            opacity: 1 - i * 0.1,
                        }} />
                ))}
            </div>

            {/* ─── BOEING AIRPLANE TAKEOFF ANIMATION ───────────────────────────────────────── */}
            <AnimatePresence>
                {takingOff && (
                    <motion.div
                        initial={{ y: 250, opacity: 0, scale: 0.6, x: '-50%' }}
                        animate={{
                            y: -900,
                            opacity: [0, 1, 1, 0.8, 0],
                            scale: [0.6, 1.2, 2.2],
                            rotate: [0, -5, -20]
                        }}
                        transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
                        className="fixed bottom-0 left-1/2 z-50 pointer-events-none flex flex-col items-center"
                    >
                        {/* Jet Thruster Exhaust Glow */}
                        <div className="relative">
                            <Boeing777SVG />
                            <motion.div
                                animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
                                transition={{ repeat: Infinity, duration: 0.2 }}
                                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-8 h-16 rounded-full bg-gradient-to-b from-sky-400 via-amber-400 to-transparent blur-sm"
                            />
                            {/* Twin Engine Contrails */}
                            <div className="absolute -bottom-20 left-4 w-1.5 h-24 bg-white/40 blur-[2px]" />
                            <div className="absolute -bottom-20 right-4 w-1.5 h-24 bg-white/40 blur-[2px]" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                        style={{ background: 'var(--btn-primary-bg)', boxShadow: '0 0 40px var(--electric-glow)' }}
                    >
                        <Plane className="text-white" size={30} />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">SmartCrew Portal</h1>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span style={{ width: '24px', height: '1px', background: 'var(--electric)' }} />
                        <p className="hud-label">AVIATION OPERATIONS CENTER</p>
                        <span style={{ width: '24px', height: '1px', background: 'var(--electric)' }} />
                    </div>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8 shadow-2xl" style={{ boxShadow: '0 0 60px var(--electric-glow)' }}>
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
