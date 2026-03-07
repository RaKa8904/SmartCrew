import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#020617' }}>
            {/* Global radar-grid background */}
            <div className="radar-bg" />

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
