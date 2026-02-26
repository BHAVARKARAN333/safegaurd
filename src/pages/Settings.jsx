import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield, Database, Save, RotateCcw } from 'lucide-react';

function Settings() {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 800);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">System Preferences</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage Command Center configuration and routing endpoints.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                >
                    {isSaving ? <RotateCcw size={18} className="animate-spin" /> : <Save size={18} />}
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            <div className="space-y-6">

                {/* Admin Profile Details */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                        <User className="text-slate-500" size={20} />
                        <h2 className="font-semibold text-slate-800">Administrator Profile</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Authenticated Email</label>
                            <input
                                type="email"
                                disabled
                                value={user?.email || "admin@safeguard.local"}
                                className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg p-3 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Display Role</label>
                            <input
                                type="text"
                                defaultValue="Chief Dispatch Officer"
                                className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Notification Routing */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                        <Bell className="text-slate-500" size={20} />
                        <h2 className="font-semibold text-slate-800">Alert Routing</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <ToggleSetting
                            label="Desktop Push Notifications"
                            description="Receive system tray alerts when a new SOS is triggered."
                            defaultChecked={true}
                        />
                        <div className="h-px bg-slate-100 w-full my-2"></div>
                        <ToggleSetting
                            label="Critical Emergency Sounds"
                            description="Play the high-pitched siren audio on urgent risks (Score > 8)."
                            defaultChecked={true}
                        />
                        <div className="h-px bg-slate-100 w-full my-2"></div>
                        <ToggleSetting
                            label="SMS Dispatch Integration"
                            description="Automatically SMS the nearest patrol unit upon emergency validation."
                            defaultChecked={false}
                        />
                    </div>
                </div>

                {/* API & Data Security */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                        <Database className="text-slate-500" size={20} />
                        <h2 className="font-semibold text-slate-800">Data & Retention</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Incident Data Retention</label>
                            <select className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                                <option>30 Days</option>
                                <option>90 Days</option>
                                <option>1 Year</option>
                                <option>Indefinite (Legal Hold)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Map Tile Provider</label>
                            <select className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                                <option>Google Maps (Satellite)</option>
                                <option>Mapbox High-Res</option>
                                <option>OpenStreetMap (Vector)</option>
                            </select>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function ToggleSetting({ label, description, defaultChecked }) {
    const [checked, setChecked] = useState(defaultChecked);

    return (
        <div className="flex items-start justify-between">
            <div>
                <h3 className="font-medium text-slate-800">{label}</h3>
                <p className="text-sm text-slate-500 mt-1">{description}</p>
            </div>
            <button
                onClick={() => setChecked(!checked)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 \${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform \${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
        </div>
    );
}

export default Settings;
