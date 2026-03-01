import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto ml-64 p-10 bg-slate-950">
                <div className="max-w-7xl mx-auto h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
