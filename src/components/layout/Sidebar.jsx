import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, Radio, BarChart2, List, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            if (logout) await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const navClass = ({ isActive }) =>
        `flex items-center px-4 py-3 mx-3 mb-1 rounded-lg text-sm font-medium transition-all duration-200 relative \${
            isActive 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`;

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen fixed left-0 top-0 flex flex-col pt-6 z-20 shadow-xl">
            {/* Header / Logo */}
            <div className="px-6 mb-8 flex items-center">
                <div className="bg-blue-600 p-1.5 rounded-lg mr-3 shadow-md shadow-blue-500/30">
                    <Shield className="text-white" size={24} strokeWidth={2} />
                </div>
                <div>
                    <h1 className="text-white text-xl font-bold tracking-tight leading-none">SafeGuard</h1>
                    <p className="text-[10px] text-blue-300 font-semibold tracking-widest mt-1 uppercase">Command Center</p>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 space-y-1">
                <p className="px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Main Menu</p>

                <NavLink to="/dashboard" className={navClass}>
                    <Radio size={18} className="mr-3" /> Dashboard
                    <span className="absolute right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-red-500/40">Live</span>
                </NavLink>

                <NavLink to="/analytics" className={navClass}>
                    <BarChart2 size={18} className="mr-3" /> Analytics
                </NavLink>

                <NavLink to="/incidents" className={navClass}>
                    <List size={18} className="mr-3" /> All Incidents
                </NavLink>

                <div className="my-6 border-t border-slate-800 mx-6"></div>

                <p className="px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System</p>

                <NavLink to="/settings" className={navClass}>
                    <Settings size={18} className="mr-3" /> Settings
                </NavLink>
            </div>

            {/* Footer / User Profile Area */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-red-400 transition-colors"
                >
                    <LogOut size={18} className="mr-3" /> Sign Out
                </button>
                <div className="mt-4 px-2 text-[11px] text-slate-500 flex justify-between items-center">
                    <span>Mumbai Police Dept</span>
                    <span>v2.0.0</span>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
