import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

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
        <div className="flex h-screen overflow-hidden" style={{ background: '#020617' }}>
            {/* Global radar-grid background */}
            <div className="radar-bg" />

            <button
                type="button"
                onClick={() => navigate('/notifications')}
                className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-full border border-sky-500/20 bg-slate-950/80 px-4 py-3 text-sky-300 shadow-2xl shadow-sky-900/20 backdrop-blur-xl transition-all hover:border-sky-400/40 hover:bg-slate-900"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="min-w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center px-1.5">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <main 
                className={`flex-1 overflow-auto transition-all duration-300 relative z-10 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}
            >
                <div className={`max-w-screen-2xl mx-auto ${isSidebarOpen ? 'p-8' : 'p-8 pb-8 pt-8 pl-12'}`}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
