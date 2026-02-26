import React from 'react';
import { Search, Bell, Activity } from 'lucide-react';

function Topbar() {
    return (
        <div className="h-16 bg-white ml-64 flex items-center justify-between px-6 border-b border-slate-200 z-10 sticky top-0 shadow-sm">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full px-4 py-2 w-full max-w-md focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                    <Search size={16} className="text-slate-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search incidents, officers, locations..."
                        className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder-slate-400"
                    />
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">

                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-px bg-slate-200 mx-2"></div>

                {/* System Status Indicator */}
                <div className="flex items-center bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
                    <Activity size={14} className="text-emerald-500 mr-2 animate-pulse" />
                    <div className="text-[11px] leading-tight">
                        <p className="font-bold text-emerald-700">System Online</p>
                        <p className="text-emerald-600/70 font-medium">Real-time sync active</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Topbar;
