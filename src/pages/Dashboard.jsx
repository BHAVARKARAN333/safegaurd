import React, { useState } from 'react';
import { useIncidents } from '../context/IncidentContext';
import MapView from '../components/dashboard/MapView';
import { Camera, X } from 'lucide-react';

function EvidenceModal({ imageUrl, onClose }) {
    if (!imageUrl) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-3xl w-full border border-slate-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Camera size={18} className="text-red-500" />
                        Auto-Captured SOS Evidence
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-slate-200 transition-colors text-slate-500 hover:text-red-500"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 bg-slate-100">
                    <div className="flex justify-between items-center mb-3 text-xs font-mono text-slate-500 font-semibold px-2">
                        <span>SOURCE: VICTIM DEVICE FRONT/BACK CAMERA</span>
                        <span className="text-red-500 animate-pulse">● SECURE ENCRYPTED UPLINK</span>
                    </div>
                    <div className="rounded-xl overflow-hidden border-2 border-slate-200 bg-black aspect-video flex items-center justify-center relative shadow-inner">
                        <img
                            src={imageUrl}
                            alt="SOS Evidence"
                            className="w-full h-full object-cover opacity-90"
                        />
                        {/* Fake crosshair/HUD overlay for wow-factor */}
                        <div className="absolute inset-0 pointer-events-none border border-white/10 m-4 rounded"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                            <div className="w-16 h-16 border border-white rounded-full"></div>
                            <div className="w-1 h-3 bg-white absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full"></div>
                            <div className="w-1 h-3 bg-white absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full"></div>
                            <div className="h-1 w-3 bg-white absolute left-0 top-1/2 -translate-x-full -translate-y-1/2"></div>
                            <div className="h-1 w-3 bg-white absolute right-0 top-1/2 translate-x-full -translate-y-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Dashboard() {
    const { incidents, loading } = useIncidents();
    const [filter, setFilter] = React.useState('Active');
    const [focusedIncident, setFocusedIncident] = React.useState(null);
    const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
    const [currentEvidenceUrl, setCurrentEvidenceUrl] = useState(null);

    if (loading) {
        return <div className="h-full flex items-center justify-center text-slate-500 font-medium">Establishing Satellite Uplink...</div>;
    }

    const activeCount = incidents.filter(i => i.status === 'Active').length;
    const assignedCount = incidents.filter(i => i.status === 'Assigned').length;

    const filteredIncidents = incidents.filter(inc => {
        if (filter === 'All') return true;
        if (filter === 'Active') return inc.status === 'Active' || inc.status === 'Assigned';
        if (filter === 'Resolved') return inc.status === 'Resolved';
        return true;
    });

    const handleOpenEvidence = (e, url) => {
        e.stopPropagation();
        setCurrentEvidenceUrl(url);
        setEvidenceModalOpen(true);
    };

    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 relative">

            {/* Evidence Modal Portal Overlay */}
            {evidenceModalOpen && (
                <EvidenceModal
                    imageUrl={currentEvidenceUrl}
                    onClose={() => setEvidenceModalOpen(false)}
                />
            )}

            {/* Left Column: Stats & Map */}
            <div className="lg:col-span-2 flex flex-col space-y-6">

                {/* Top Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                        <p className="text-slate-500 text-sm font-medium mb-1">Total Incidents</p>
                        <p className="text-3xl font-bold text-slate-800">{incidents.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -z-10"></div>
                        <p className="text-red-500 text-sm font-medium mb-1">Active SOS</p>
                        <p className="text-3xl font-bold text-red-600">{activeCount}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -z-10"></div>
                        <p className="text-orange-500 text-sm font-medium mb-1">Units Assigned</p>
                        <p className="text-3xl font-bold text-orange-600">{assignedCount}</p>
                    </div>
                </div>

                {/* Satellite Map View */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-2 min-h-[400px]">
                    <MapView
                        incidents={filteredIncidents}
                        focusedIncident={focusedIncident} // Pass down focus info
                    />
                </div>
            </div>

            {/* Right Column: Priority Feed & Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">

                <div className="p-5 pb-3 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex justify-between items-center">
                        Incident Feed
                        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{filteredIncidents.length} Records</span>
                    </h3>

                    {/* Filter Toggle Buttons */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {['All', 'Active', 'Resolved'].map((f) => (
                            <button
                                key={f}
                                onClick={() => { setFilter(f); setFocusedIncident(null); }}
                                className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${filter === f
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 pt-3 space-y-3">
                    {filteredIncidents.length === 0 ? (
                        <div className="text-center text-slate-400 py-10 mt-10">
                            No {filter.toLowerCase()} incidents detected.
                        </div>
                    ) : (
                        filteredIncidents.map(inc => {
                            console.log("Rendering Incident on Dashboard:", inc);
                            return (
                                <div
                                    key={inc.id}
                                    onClick={() => setFocusedIncident(inc)}
                                    className={`p-4 rounded-xl border-l-4 shadow-sm cursor-pointer transition-all hover:scale-[1.01] ${inc.status === 'Active' ? 'bg-red-50 border-l-red-500' :
                                        inc.status === 'Assigned' ? 'bg-orange-50 border-l-orange-500' :
                                            'bg-slate-50 border-l-emerald-500'
                                        } ${focusedIncident?.id === inc.id ? 'ring-2 ring-blue-400 shadow-md' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-slate-800 text-sm">#{inc.id.slice(-6).toUpperCase()}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${inc.status === 'Active' ? 'bg-red-100 text-red-700' :
                                            inc.status === 'Assigned' ? 'bg-orange-100 text-orange-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>{inc.status}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium mb-1">Reporter: {inc.userId || 'Anonymous'}</p>

                                    {inc.location && (
                                        <div className="mt-2 space-y-2">
                                            <p className="text-[10px] text-slate-500 font-mono tracking-wider">
                                                {inc.location.latitude?.toFixed(4)}, {inc.location.longitude?.toFixed(4)}
                                            </p>
                                            <div className="flex flex-col gap-1.5 mt-2">
                                                {/* Primary Location Action */}
                                                <a
                                                    href={"https://www.google.com/maps/dir/" + inc.location.latitude + "," + inc.location.longitude + "/Police+Station"}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()} // Prevent card click when clicking button
                                                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-1.5 rounded transition-colors shadow-sm cursor-pointer"
                                                >
                                                    Open Live Google Map 📍
                                                </a>

                                                {/* Auto-Captured Evidence Action */}
                                                {inc.evidenceUrl && (
                                                    <button
                                                        onClick={(e) => handleOpenEvidence(e, inc.evidenceUrl)}
                                                        className="w-full flex justify-center items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold py-1.5 rounded transition-colors shadow-sm cursor-pointer"
                                                    >
                                                        <Camera size={12} className="text-red-400" />
                                                        View Evidence
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
