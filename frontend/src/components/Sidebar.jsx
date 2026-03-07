import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, Plane, Settings, FileText,
    Calendar, Clock, LogOut, Radio, Bell, AlertTriangle,
    ChevronRight, Zap, Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const roleBadge = {
    admin: { label: 'ADMIN', color: 'bg-amber-500/15 text-amber-400 border border-amber-500/20' },
    scheduler: { label: 'OPS', color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20' },
    crew: { label: 'CREW', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
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
        { to: '/live-board', icon: <Radio size={18} />, label: 'Live Flight Board' },
        { to: '/rules', icon: <Settings size={18} />, label: 'System Rules' },
        { to: '/reports', icon: <FileText size={18} />, label: 'Reports' },
        { to: '/notifications', icon: <Bell size={18} />, label: 'Notifications', badge: unreadCount },
    ];

    const schedulerLinks = [
        { to: '/generate', icon: <Zap size={18} />, label: 'Auto Schedule' },
        { to: '/inbox', icon: <Inbox size={18} />, label: 'Approval Inbox' },
        { to: '/live-board', icon: <Radio size={18} />, label: 'Live Flight Board' },
        { to: '/conflicts', icon: <AlertTriangle size={18} />, label: 'Conflict Viewer' },
        { to: '/notifications', icon: <Bell size={18} />, label: 'Notifications', badge: unreadCount },
    ];

    const crewLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'My Schedule' },
        { to: '/availability', icon: <Calendar size={18} />, label: 'Availability' },
        { to: '/live-board', icon: <Radio size={18} />, label: 'Flight Board' },
        { to: '/notifications', icon: <Bell size={18} />, label: 'Notifications', badge: unreadCount },
    ];

    const links = user?.role === 'admin' ? adminLinks
        : user?.role === 'scheduler' ? schedulerLinks
            : crewLinks;

    const badge = roleBadge[user?.role] || roleBadge.crew;

    return (
        <div className={`h-screen flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}
            style={{ background: 'rgba(2, 6, 23, 0.95)', borderRight: '1px solid rgba(14, 165, 233, 0.1)', backdropFilter: 'blur(20px)' }}>

            {/* Logo */}
            <div className="px-6 pt-6 pb-5 border-b" style={{ borderColor: 'rgba(14, 165, 233, 0.1)' }}>
                {/* Toggle Button */}
                <button 
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-50"
                >
                    <ChevronRight size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`flex items-center gap-3 mb-4 transition-all ${!isOpen ? 'justify-center' : ''}`}>
                    <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', boxShadow: '0 0 20px rgba(14, 165, 233, 0.35)' }}>
                        <Plane className="text-white shrink-0" size={20} />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 pulse-dot" />
                    </div>
                    {isOpen && (
                        <div className="overflow-hidden transition-all duration-300 whitespace-nowrap">
                            <h1 className="font-bold text-white leading-tight text-base tracking-tight">
                                Smart<span style={{ color: '#0ea5e9' }}>Crew</span>
                            </h1>
                            <p className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>OPS CENTER</p>
                        </div>
                    )}
                </div>
                {/* UTC Clock */}
                {isOpen && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(14, 165, 233, 0.06)', border: '1px solid rgba(14, 165, 233, 0.1)' }}>
                        <span className="hud-label">UTC</span>
                        <span className="hud-value text-xs">
                            {currentTime.toUTCString().slice(17, 25)}
                        </span>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                {isOpen && <p className="hud-label px-3 pb-2 transition-all duration-300">Navigation</p>}
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        title={!isOpen ? link.label : ''}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} ${!isOpen ? 'justify-center mx-auto w-10 h-10 px-0 rounded-xl' : ''}`}
                    >
                        <span className="shrink-0" style={{ color: 'inherit' }}>{link.icon}</span>
                        {isOpen && <span className="font-medium flex-1 overflow-hidden whitespace-nowrap">{link.label}</span>}
                        {link.badge > 0 && (
                            <span className={`bg-red-500 text-white font-bold rounded-full flex items-center justify-center pulse-dot ${isOpen ? 'min-w-[1.25rem] h-5 px-1.5 text-xs' : 'absolute top-0 right-0 w-3 h-3 text-[10px]'}`}>
                                {isOpen ? (link.badge > 9 ? '9+' : link.badge) : ''}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile */}
            <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(14, 165, 233, 0.08)' }}>
                <div className={`flex items-center gap-3 mb-3 ${!isOpen ? 'justify-center px-0' : 'px-1'}`}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                        style={{ background: 'rgba(14, 165, 233, 0.12)', border: '1px solid rgba(14, 165, 233, 0.2)', color: '#0ea5e9' }}
                        title={!isOpen ? user?.name : ''}>
                        {user?.name?.[0]}
                    </div>
                    {isOpen && (
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${badge.color}`}>{badge.label}</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={logout}
                    title={!isOpen ? "Sign Out" : ""}
                    className={`flex items-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${!isOpen ? 'justify-center w-10 h-10 mx-auto' : 'px-3 w-full'}`}
                    style={{ color: '#64748b' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
                >
                    <LogOut size={16} className="shrink-0" />
                    {isOpen && <span className="whitespace-nowrap">Sign Out</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
