import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, Plane, Settings, FileText,
    Calendar, Clock, LogOut, Radio, AlertTriangle,
    ChevronRight, Zap, Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const roleBadge = {
    admin: { label: 'ADMIN', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' },
    scheduler: { label: 'OPS', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20' },
    crew: { label: 'CREW', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' },
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await api.get('/notifications/unread-count');
                setUnreadCount(res.data.count);
            } catch { /* silent */ }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const tick = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    const adminLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { to: '/crew', icon: <Users size={18} />, label: 'Crew Management' },
        { to: '/flights', icon: <Plane size={18} />, label: 'Flight Operations' },
        { to: '/inbox', icon: <Inbox size={18} />, label: 'Approval Inbox' },
        { to: '/rules', icon: <Settings size={18} />, label: 'System Rules' },
        { to: '/reports', icon: <FileText size={18} />, label: 'Reports' },
    ];

    const schedulerLinks = [
        { to: '/generate', icon: <Zap size={18} />, label: 'Auto Schedule' },
        { to: '/inbox', icon: <Inbox size={18} />, label: 'Approval Inbox' },
        { to: '/live-board', icon: <Radio size={18} />, label: 'Live Flight Board' },
        { to: '/conflicts', icon: <AlertTriangle size={18} />, label: 'Conflict Viewer' },
    ];

    const crewLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'My Schedule' },
        { to: '/availability', icon: <Calendar size={18} />, label: 'Availability' },
        { to: '/live-board', icon: <Radio size={18} />, label: 'Flight Board' },
    ];

    const links = user?.role === 'admin' ? adminLinks
        : user?.role === 'scheduler' ? schedulerLinks
            : crewLinks;

    const badge = roleBadge[user?.role] || roleBadge.crew;

    return (
        <div className={`h-screen w-64 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', backdropFilter: 'blur(20px)' }}>

            {/* ChatGPT-style Sidebar Collapse Button & Hover Handle */}
            <div 
                className="absolute right-0 top-0 h-full w-3 group cursor-pointer z-50"
                style={{ transform: 'translateX(50%)' }}
                onClick={(e) => {
                    e.stopPropagation();
                    toggleSidebar();
                }}
            >
                {/* Hover handle line */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[4px] bg-primary-500/0 group-hover:bg-primary-500/30 dark:group-hover:bg-primary-400/20 transition-all duration-300 rounded-full my-6" />
                
                {/* Toggle pill button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleSidebar();
                    }}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-10 rounded-md border flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 ${isOpen ? 'opacity-0 group-hover:opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
                    style={{
                        background: 'var(--sidebar-bg)',
                        borderColor: 'var(--sidebar-border)',
                        color: 'var(--text-base)',
                        cursor: 'pointer'
                    }}
                >
                    <ChevronRight 
                        size={14} 
                        className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                </button>
            </div>

            {/* Logo */}
            <div className="px-6 pt-6 pb-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'var(--btn-primary-bg)', boxShadow: '0 0 20px var(--logo-glow)' }}>
                        <Plane className="text-white shrink-0" size={20} />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 pulse-dot" />
                    </div>
                    <div className="overflow-hidden transition-all duration-300 whitespace-nowrap">
                        <h1 className="font-bold text-[var(--text-base)] leading-tight text-base tracking-tight">
                            Smart<span style={{ color: 'var(--electric)' }}>Crew</span>
                        </h1>
                        <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>OPS CENTER</p>
                    </div>
                </div>
                {/* UTC Clock */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--clock-bg)', border: '1px solid var(--clock-border)' }}>
                    <span className="hud-label">UTC</span>
                    <span className="hud-value text-xs">
                        {currentTime.toUTCString().slice(17, 25)}
                    </span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                <p className="hud-label px-3 pb-2">Navigation</p>
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="shrink-0" style={{ color: 'inherit' }}>{link.icon}</span>
                        <span className="font-medium flex-1 overflow-hidden whitespace-nowrap">{link.label}</span>
                        {link.badge > 0 && (
                            <span className="bg-red-500 text-white font-bold rounded-full flex items-center justify-center pulse-dot w-5 h-5 px-1.5 text-xs">
                                {link.badge > 9 ? '9+' : link.badge}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile */}
            <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
                <div className="flex items-center gap-3 mb-3 px-1">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                        style={{ background: 'var(--clock-bg)', border: '1px solid var(--clock-border)', color: 'var(--electric)' }}>
                        {user?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-sm font-semibold text-[var(--text-base)] truncate">{user?.name}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${badge.color}`}>{badge.label}</span>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all px-3 w-full"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                >
                    <LogOut size={16} className="shrink-0" />
                    <span className="whitespace-nowrap">Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
