import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function MainLayout() {
    return (
        <div className="flex bg-slate-50 min-h-screen font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col w-full h-screen overflow-hidden">
                <Topbar />
                {/* Main Dashboard Workspace area */}
                <main className="flex-1 ml-64 p-6 overflow-y-auto w-[calc(100%-16rem)] relative bg-slate-100">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;
