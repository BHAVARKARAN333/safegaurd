import React, { useState } from 'react';
import { useIncidents } from '../context/IncidentContext';
import { AlertOctagon, CheckCircle2, Clock, MapPin, Search, Filter, Download, Eye } from 'lucide-react';
import IncidentDetailsModal from '../components/dashboard/IncidentDetailsModal';

function Incidents() {
    const { incidents, loading, updateIncidentStatus } = useIncidents();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedIncident, setSelectedIncident] = useState(null);

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading incidents...</div>;
    }

    const filteredIncidents = incidents.filter(incident => {
        const matchesSearch = incident.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || incident.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleResolve = (id) => {
        if (window.confirm("Mark this incident as resolved?")) {
            updateIncidentStatus(id, "Resolved");
        }
    };

    const handleExportCSV = () => {
        if (filteredIncidents.length === 0) return;

        const headers = ['Incident ID', 'Reporter', 'Email', 'Phone', 'Status', 'Risk Score', 'Assigned Station', 'Address', 'Latitude', 'Longitude', 'Date', 'Time'];
        const csvRows = [headers.join(',')];

        filteredIncidents.forEach(inc => {
            const dateObj = inc.createdAt instanceof Date ? inc.createdAt : (inc.createdAt?.toDate?.() || new Date());
            const dateStr = dateObj.toLocaleDateString('en-IN');
            const timeStr = dateObj.toLocaleTimeString('en-IN');

            const row = [
                `"${inc.id}"`,
                `"${inc.userId}"`,
                `"${inc.userEmail || ''}"`,
                `"${inc.userPhone || ''}"`,
                `"${inc.status}"`,
                inc.riskScore || 5,
                `"${inc.assignedStationName || 'Pending'}"`,
                `"${inc.address || ''}"`,
                inc.location?.latitude || '',
                inc.location?.longitude || '',
                `"${dateStr}"`,
                `"${timeStr}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `Safeguard_Report_${new Date().getTime()}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">All Incidents</h1>
                    <p className="text-slate-500 text-sm mt-1">Review and manage all historical and active emergency reports.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-sm"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-sm appearance-none pr-8"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>

                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Incident Details</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Reporter</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Location</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Time</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIncidents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                                        No incidents found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredIncidents.map((incident) => (
                                    <tr key={incident.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {incident.status === 'Active' ? (
                                                    <div className="p-2 bg-red-100 rounded-lg">
                                                        <AlertOctagon size={18} className="text-red-600" />
                                                    </div>
                                                ) : (
                                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                                        <CheckCircle2 size={18} className="text-emerald-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                                                        #{incident.id.slice(0, 6).toUpperCase()}
                                                        {incident.status === 'Active' && (
                                                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">Risk Score: {incident.riskScore}/10</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            {incident.userId}
                                        </td>
                                        <td className="px-6 py-4">
                                            {incident.location ? (
                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    {incident.location.latitude.toFixed(4)}, {incident.location.longitude.toFixed(4)}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">No GPS Data</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <Clock size={14} className="text-slate-400" />
                                                {incident.createdAt.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => setSelectedIncident(incident)}
                                                    className="flex items-center gap-1 font-medium text-slate-600 hover:text-blue-600 transition-colors"
                                                >
                                                    <Eye size={16} /> Details
                                                </button>

                                                {incident.status === 'Active' ? (
                                                    <button
                                                        onClick={() => handleResolve(incident.id)}
                                                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        Resolve
                                                    </button>
                                                ) : (
                                                    <span className="text-emerald-600 font-medium text-sm flex items-center justify-end gap-1">
                                                        <CheckCircle2 size={14} /> Resolved
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Evidence Modal rendered safely outside the table DOM hierarchy */}
            {selectedIncident && (
                <IncidentDetailsModal
                    incident={selectedIncident}
                    onClose={() => setSelectedIncident(null)}
                />
            )}
        </div>
    );
}

export default Incidents;
