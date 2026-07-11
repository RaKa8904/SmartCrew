import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Sun, Moon, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await api.get('/notifications/unread-count');
                setUnreadCount(res.data.count);
            } catch {
                setUnreadCount(0);
            }
        };

        fetchUnread();
        const interval = setInterval(fetchUnread, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
            {/* Global radar-grid background */}
            <div className="radar-bg" />

            {/* Actions Bar (fixed top-right) */}
            <div className="fixed right-6 top-6 z-50 flex items-center gap-3">
                {/* Theme Selector Pill */}
                <div className="flex items-center gap-0.5 bg-slate-950/85 border border-slate-800/40 p-1.5 rounded-full backdrop-blur-xl shadow-2xl">
                    <button
                        onClick={() => setTheme('light')}
                        className={`p-1.5 rounded-full transition-all cursor-pointer ${theme === 'light' ? 'bg-primary-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                        title="Light Mode"
                    >
                        <Sun size={15} />
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        className={`p-1.5 rounded-full transition-all cursor-pointer ${theme === 'dark' ? 'bg-primary-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                        title="Dark Mode"
                    >
                        <Moon size={15} />
                    </button>
                    <button
                        onClick={() => setTheme('system')}
                        className={`p-1.5 rounded-full transition-all cursor-pointer ${theme === 'system' ? 'bg-primary-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                        title="System Preference"
                    >
                        <Monitor size={15} />
                    </button>
                </div>

                {/* Notifications Button */}
                <button
                    type="button"
                    onClick={() => navigate('/notifications')}
                    className="flex items-center gap-2 rounded-full border border-sky-500/20 bg-slate-950/80 px-4 py-3 text-sky-300 shadow-2xl shadow-sky-900/20 backdrop-blur-xl transition-all hover:border-sky-400/40 hover:bg-slate-900"
                >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span className="min-w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center px-1.5">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </div>

            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <main 
                className={`flex-1 overflow-auto transition-all duration-300 relative z-10 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}
            >
                <div className={`max-w-screen-2xl mx-auto ${isSidebarOpen ? 'p-8 pr-28' : 'p-8 pb-8 pt-8 pl-12 pr-28'}`}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
