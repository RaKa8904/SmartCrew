import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const DEMO_CREDS = [
    { role: 'Admin', email: 'admin@airline.com', pw: 'password123', colorClass: 'text-amber-600 dark:text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { role: 'Scheduler', email: 'scheduler@airline.com', pw: 'password123', colorClass: 'text-sky-600 dark:text-sky-500 bg-sky-500/10 border-sky-500/20' },
    { role: 'Pilot', email: 'pilot1@airline.com', pw: 'password123', colorClass: 'text-purple-600 dark:text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { role: 'Cabin', email: 'cabin1@airline.com', pw: 'password123', colorClass: 'text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
];

const RealisticBoeing777 = ({ isSpooling }) => (
    <div className="relative flex flex-col items-center drop-shadow-[0_0_35px_rgba(14,165,233,0.6)]">
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
                animate={isSpooling ? { scaleY: [1, 2.5, 1.5], opacity: [0.8, 1, 0.9] } : { scaleY: [1, 1.6, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: isSpooling ? 0.05 : 0.15 }}
                className="w-4 h-20 bg-gradient-to-b from-sky-400 via-amber-400 to-transparent rounded-full blur-[2px]"
            />
            <motion.div
                animate={isSpooling ? { scaleY: [1, 2.5, 1.5], opacity: [0.8, 1, 0.9] } : { scaleY: [1, 1.6, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: isSpooling ? 0.05 : 0.15 }}
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
    const [flightState, setFlightState] = useState('idle'); // idle | spool | fly
    const { login } = useAuth();
    const navigate = useNavigate();
    const reduceMotion = useReducedMotion();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            if (reduceMotion) {
                navigate('/dashboard');
                return;
            }
            setFlightState('spool');
            // Engine spooling duration
            setTimeout(() => {
                setFlightState('fly');
                // Flight to dashboard duration
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1400);
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Check email and password.');
            setLoading(false);
            setFlightState('idle');
        }
    };

    const quickFill = (cred) => { setEmail(cred.email); setPassword(cred.pw); };

    const springPhysics = { type: "spring", stiffness: 300, damping: 25 };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.1 }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: { duration: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: springPhysics }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950">

            {/* Animated aviation background */}
            <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20">
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }} className="text-slate-300 dark:text-sky-900" />
            </div>

            {/* Plane Takeoff Sequence */}
            <AnimatePresence>
                {flightState !== 'idle' && (
                    <motion.div
                        initial={{ y: 400, opacity: 0, scale: 0.8, x: '-50%', rotate: 0 }}
                        animate={
                            flightState === 'spool' 
                                ? { y: 150, opacity: 1, scale: 1, x: '-50%', rotate: [-1, 1, -1, 1, 0] }
                                : { y: -1500, opacity: [1, 1, 0], scale: 3, x: '-50%', rotate: -15 }
                        }
                        transition={
                            flightState === 'spool'
                                ? { 
                                    y: springPhysics, 
                                    opacity: { duration: 0.3 }, 
                                    rotate: { duration: 0.1, repeat: Infinity, ease: "linear" } 
                                  }
                                : { 
                                    y: { ease: "easeIn", duration: 1.2 }, 
                                    scale: { ease: "easeIn", duration: 1.2 }, 
                                    rotate: { type: "spring", stiffness: 100, damping: 20 },
                                    opacity: { duration: 0.3, delay: 0.9 }
                                  }
                        }
                        className="fixed bottom-0 left-1/2 z-50 pointer-events-none flex flex-col items-center"
                    >
                        <RealisticBoeing777 isSpooling={flightState === 'spool'} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sign-in Form */}
            <AnimatePresence mode="wait">
                {flightState === 'idle' && (
                    <motion.div
                        key="login-form"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="w-full max-w-md relative z-10"
                    >
                        {/* Header */}
                        <motion.div variants={itemVariants} className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-sky-500 shadow-lg shadow-sky-500/20">
                                <Plane className="text-white" size={30} strokeWidth={1.5} />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">SmartCrew Portal</h1>
                            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mt-2">Aviation Operations Center</p>
                        </motion.div>

                        {/* Login Card */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="p-3 rounded-xl text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold mb-2 text-slate-500 tracking-wider">EMAIL ADDRESS</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-slate-400" size={16} strokeWidth={1.5} />
                                        <input
                                            type="email" value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 pl-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                                            placeholder="name@airline.com" required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold mb-2 text-slate-500 tracking-wider">PASSWORD</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-slate-400" size={16} strokeWidth={1.5} />
                                        <input
                                            type="password" value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 pl-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                                            placeholder="••••••••" required
                                        />
                                    </div>
                                </div>

                                <motion.button 
                                    whileTap={reduceMotion ? {} : { scale: 0.97 }}
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} strokeWidth={1.5} /> : (
                                        <>Authorization Clearance <ArrowRight size={16} strokeWidth={1.5} /></>
                                    )}
                                </motion.button>
                            </form>

                            <p className="mt-6 text-center text-sm text-slate-500">
                                New crew member?{' '}
                                <Link to="/register" className="font-semibold text-sky-500 hover:text-sky-600 transition-colors">
                                    Request Access
                                </Link>
                            </p>
                        </motion.div>

                        {/* Quick access demo panel */}
                        <motion.div variants={itemVariants} className="mt-6 bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <p className="text-xs font-bold tracking-widest text-center mb-3 text-slate-500">⚡ DEMO QUICK ACCESS</p>
                            <div className="grid grid-cols-2 gap-2">
                                {DEMO_CREDS.map(cred => (
                                    <motion.button 
                                        whileTap={reduceMotion ? {} : { scale: 0.97 }}
                                        key={cred.role} 
                                        onClick={() => quickFill(cred)}
                                        className={`text-left p-3 rounded-xl transition-all border ${cred.colorClass} hover:opacity-80`}
                                    >
                                        <p className="text-xs font-bold">{cred.role}</p>
                                        <p className="text-xs mt-0.5 truncate opacity-70">{cred.email}</p>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoginPage;
