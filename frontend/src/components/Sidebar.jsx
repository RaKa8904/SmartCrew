import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Plane, Settings, FileText, Calendar, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const adminLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/crew', icon: <Users size={20} />, label: 'Manage Crew' },
        { to: '/flights', icon: <Plane size={20} />, label: 'Manage Flights' },
        { to: '/rules', icon: <Settings size={20} />, label: 'Rules' },
        { to: '/reports', icon: <FileText size={20} />, label: 'Reports' },
    ];

    const schedulerLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/generate', icon: <Clock size={20} />, label: 'Auto Schedule' },
        { to: '/conflicts', icon: <FileText size={20} />, label: 'Conflicts' },
    ];

    const crewLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'My Schedule' },
        { to: '/availability', icon: <Calendar size={20} />, label: 'Availability' },
    ];

    const links = user?.role === 'admin' ? adminLinks :
        user?.role === 'scheduler' ? schedulerLinks :
            crewLinks;

    return (
        <div className="w-64 h-screen bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 fixed left-0 top-0">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <Plane className="text-white" size={24} />
                </div>
                <h1 className="font-bold text-xl tracking-tight text-white leading-tight">
                    Smart <span className="text-primary-500">Crew</span>
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        {link.icon}
                        <span className="font-medium">{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 px-2 mb-6">
                    <div className="w-10 h-10 bg-slate-800 rounded-full border border-white/10 flex items-center justify-center font-bold text-primary-500">
                        {user?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 w-full cursor-pointer"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
