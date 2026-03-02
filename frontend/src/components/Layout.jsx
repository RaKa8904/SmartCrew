import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#020617' }}>
            {/* Global radar-grid background */}
            <div className="radar-bg" />

            <Sidebar />

            <main className="flex-1 overflow-auto ml-64 relative z-10">
                <div className="max-w-screen-2xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
