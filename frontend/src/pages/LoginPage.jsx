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

// Realistic Large Boeing 777-300ER Airliner SVG
const RealisticBoeing777 = () => (
    <div className="relative flex flex-col items-center drop-shadow-[0_0_35px_rgba(14,165,233,0.9)]">
        <svg width="260" height="260" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="fuselageGrad" x1="0" y1="0" x2="100" y2="100">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="50%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
                <linearGradient id="wingGrad" x1="0" y1="0" x2="0" y2="100">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#334155" />
                </linearGradient>
                <linearGradient id="engineGrad" x1="0" y1="0" x2="100" y2="0">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
            </defs>

            {/* Main Wings with Raked Wingtips */}
            <path d="M 50 42 L 5 62 L 7 68 L 48 55 Z" fill="url(#wingGrad)" stroke="#e2e8f0" strokeWidth="0.5" />
            <path d="M 50 42 L 95 62 L 93 68 L 52 55 Z" fill="url(#wingGrad)" stroke="#e2e8f0" strokeWidth="0.5" />

            {/* Raked Winglets */}
            <path d="M 5 62 L 2 56 L 6 60 Z" fill="#0ea5e9" />
            <path d="M 95 62 L 98 56 L 94 60 Z" fill="#0ea5e9" />

            {/* Horizontal Stabilizers (Tail Wings) */}
            <path d="M 50 82 L 26 92 L 28 96 L 49 88 Z" fill="#64748b" />
            <path d="M 50 82 L 74 92 L 72 96 L 51 88 Z" fill="#64748b" />

            {/* Fuselage (Body) */}
            <path d="M 50 4 C 45 10 44 30 44 82 C 44 92 48 98 50 99 C 52 98 56 92 56 82 C 56 30 55 10 50 4 Z" fill="url(#fuselageGrad)" stroke="#f1f5f9" strokeWidth="0.6" />

            {/* Cockpit Windows */}
            <path d="M 47 12 C 48 10 52 10 53 12 L 54 15 L 46 15 Z" fill="#0284c7" />

            {/* Vertical Tail Fin Shadow */}
            <path d="M 49 76 L 50 72 L 51 76 L 50 96 Z" fill="#0ea5e9" />

            {/* Dual GE90 Turbofan Jet Engines */}
            <rect x="28" y="56" width="6" height="14" rx="3" fill="url(#engineGrad)" stroke="#38bdf8" strokeWidth="0.5" />
            <rect x="66" y="56" width="6" height="14" rx="3" fill="url(#engineGrad)" stroke="#38bdf8" strokeWidth="0.5" />

            {/* Red & Green Wingtip Navigation Lights */}
            <circle cx="3" cy="57" r="1.5" fill="#ef4444" className="animate-ping" />
            <circle cx="97" cy="57" r="1.5" fill="#22c55e" className="animate-ping" />
        </svg>

        {/* Dual Jet Engine Thruster Plumes */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full flex justify-between px-16 pointer-events-none">
            <motion.div
                animate={{ scaleY: [1, 1.6, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 0.15 }}
                className="w-4 h-20 bg-gradient-to-b from-sky-400 via-amber-400 to-transparent rounded-full blur-[2px]"
            />
            <motion.div
                animate={{ scaleY: [1, 1.6, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 0.15 }}
                className="w-4 h-20 bg-gradient-to-b from-sky-400 via-amber-400 to-transparent rounded-full blur-[2px]"
            />
        </div>

        {/* High Altitude Twin Smoke Contrails */}
        <div className="absolute -bottom-36 left-1/2 -translate-x-1/2 w-full flex justify-between px-16 pointer-events-none opacity-75">
            <div className="w-2 h-36 bg-gradient-to-b from-white/60 to-transparent blur-[3px]" />
            <div className="w-2 h-36 bg-gradient-to-b from-white/60 to-transparent blur-[3px]" />
        </div>
    </div>
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
            // Slower 2.8s takeoff sequence
            setTimeout(() => {
                navigate('/dashboard');
            }, 2800);
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
                            width: '6px', height: '44px',
                            background: 'var(--amber)',
                            bottom: `${10 + i * 60}px`,
                            borderRadius: '3px',
                            opacity: 1 - i * 0.1,
                        }} />
                ))}
            </div>

            {/* ─── SLOWER, REALISTIC BOEING 777 TAKEOFF ANIMATION ──────────────────────────── */}
            <AnimatePresence>
                {takingOff && (
                    <motion.div
                        initial={{ y: 350, opacity: 0, scale: 0.8, x: '-50%' }}
                        animate={{
                            y: [350, 150, -350, -1100],
                            opacity: [0, 1, 1, 0.9, 0],
                            scale: [0.8, 1.2, 2.2, 3.2],
                            rotate: [0, 0, -12, -22]
                        }}
                        transition={{ duration: 2.8, ease: [0.25, 0.1, 0.25, 1] }}
                        className="fixed bottom-0 left-1/2 z-50 pointer-events-none flex flex-col items-center"
                    >
                        <RealisticBoeing777 />
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
