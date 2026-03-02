import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TYPE_META = {
    info: { icon: <Info size={14} />, color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', cls: 'notif-info' },
    warning: { icon: <AlertTriangle size={14} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', cls: 'notif-warning' },
    success: { icon: <CheckCircle2 size={14} />, color: '#10b981', bg: 'rgba(16,185,129,0.08)', cls: 'notif-success' },
    critical: { icon: <AlertOctagon size={14} />, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', cls: 'notif-critical' },
};

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) { console.error(err); }
    };

    const markRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) { console.error(err); }
    };

    const deleteNotif = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) { console.error(err); }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const filtered = filter === 'all' ? notifications
        : filter === 'unread' ? notifications.filter(n => !n.isRead)
            : notifications.filter(n => n.type === filter);

    return (
        <div className="space-y-6 page-enter">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Bell size={14} style={{ color: '#0ea5e9' }} />
                        <span className="hud-label">SYSTEM ALERTS</span>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 pulse-dot">
                                {unreadCount} NEW
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Notifications</h1>
                    <p className="mt-1" style={{ color: '#64748b' }}>{notifications.length} total alerts in your inbox</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchNotifications} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#64748b' }}>
                        <RefreshCw size={14} />
                    </button>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="glass-button flex items-center gap-2">
                            <CheckCheck size={16} /> Mark All Read
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'unread', label: 'Unread' },
                    { key: 'critical', label: '🔴 Critical' },
                    { key: 'warning', label: '🟡 Warning' },
                    { key: 'info', label: '🔵 Info' },
                    { key: 'success', label: '🟢 Success' },
                ].map(({ key, label }) => {
                    const count = key === 'all' ? notifications.length
                        : key === 'unread' ? unreadCount
                            : notifications.filter(n => n.type === key).length;
                    return (
                        <button key={key} onClick={() => setFilter(key)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{
                                background: filter === key ? 'rgba(14,165,233,0.12)' : 'rgba(255,255,255,0.03)',
                                border: filter === key ? '1px solid rgba(14,165,233,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                color: filter === key ? '#0ea5e9' : '#64748b'
                            }}>
                            {label}
                            <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.06)' }}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Notification List */}
            <div className="space-y-2">
                {loading ? (
                    [...Array(6)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)
                ) : filtered.length === 0 ? (
                    <div className="glass-card p-16 text-center">
                        <Bell size={36} className="mx-auto mb-3 opacity-10" />
                        <p style={{ color: '#475569' }}>No notifications for this filter</p>
                    </div>
                ) : filtered.map(notif => {
                    const meta = TYPE_META[notif.type] || TYPE_META.info;
                    return (
                        <div key={notif.id}
                            className={`glass-card p-4 transition-all group ${meta.cls}`}
                            style={{ opacity: notif.isRead ? 0.65 : 1 }}
                            onClick={() => !notif.isRead && markRead(notif.id)}>
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{ background: meta.bg, color: meta.color }}>
                                    {meta.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <p className="text-sm leading-relaxed" style={{ color: notif.isRead ? '#64748b' : '#e2e8f0' }}>
                                            {notif.message}
                                        </p>
                                        <button onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg"
                                            style={{ color: '#475569' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs" style={{ color: '#475569' }}>
                                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                        </span>
                                        <span className={`status-badge text-xs`} style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}30`, padding: '1px 8px' }}>
                                            {notif.type.toUpperCase()}
                                        </span>
                                        {!notif.isRead && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-dot" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NotificationsPage;
