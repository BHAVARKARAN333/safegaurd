import React from 'react';
import { useIncidents } from '../context/IncidentContext';
import { BarChart2, TrendingUp, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CrimeHeatmap from '../components/dashboard/CrimeHeatmap';

function Analytics() {
    const { incidents, loading } = useIncidents();

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading analytics...</div>;
    }

    const totalIncidents = incidents.length;
    const activeIncidents = incidents.filter(i => i.status === 'Active').length;
    const resolvedIncidents = totalIncidents - activeIncidents;

    // Derived metric for demonstration
    const avgRiskScore = totalIncidents > 0
        ? (incidents.reduce((sum, i) => sum + (i.riskScore || 5), 0) / totalIncidents).toFixed(1)
        : 0;

    const resolutionRate = totalIncidents > 0
        ? Math.round((resolvedIncidents / totalIncidents) * 100)
        : 0;

    // Process data for the Recharts graph (Last 7 Days Trend)
    const generateChartData = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dataMap = new Map();

        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dataMap.set(days[d.getDay()], 0);
        }

        // Count incidents per day
        incidents.forEach(inc => {
            if (inc.createdAt) {
                const dayName = days[inc.createdAt.getDay()];
                if (dataMap.has(dayName)) {
                    dataMap.set(dayName, dataMap.get(dayName) + 1);
                }
            }
        });

        return Array.from(dataMap, ([name, incidents]) => ({ name, incidents }));
    };

    const chartData = generateChartData();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">System Analytics</h1>
                <p className="text-slate-500 text-sm mt-1">Key performance indicators and system-wide telemetry.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Incidents"
                    value={totalIncidents.toString()}
                    subtitle="All time reports"
                    icon={<DatabaseIcon />}
                    color="blue"
                />
                <MetricCard
                    title="Active Emergencies"
                    value={activeIncidents.toString()}
                    subtitle="Requires immediate action"
                    icon={<AlertOctagon size={24} />}
                    color="red"
                />
                <MetricCard
                    title="Resolved Cases"
                    value={resolvedIncidents.toString()}
                    subtitle={`${resolutionRate}% resolution rate`}
                    icon={<CheckCircle2 size={24} />}
                    color="emerald"
                />
                <MetricCard
                    title="Avg Risk Score"
                    value={`${avgRiskScore}/10`}
                    subtitle="Across all active incidents"
                    icon={<ShieldAlert size={24} />}
                    color="orange"
                />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800">7-Day Incident Trend</h3>
                        <BarChart2 className="text-slate-400" size={20} />
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="incidents"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorInc)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800">System Activity Metrics</h3>
                        <TrendingUp className="text-slate-400" size={20} />
                    </div>
                    <div className="space-y-6">
                        <MetricProgressBar label="Uptime (99.9%)" percentage={99.9} color="bg-emerald-500" />
                        <MetricProgressBar label="GPS Accuracy (<10m)" percentage={85} color="bg-blue-500" />
                        <MetricProgressBar label="Average Response Time (<2m)" percentage={70} color="bg-orange-500" />
                        <MetricProgressBar label="False Alarm Rate" percentage={12} color="bg-red-500" />
                    </div>
                </div>
            </div>

            {/* AI Crime Heatmap */}
            <CrimeHeatmap incidents={incidents} />
        </div>
    );
}

function MetricCard({ title, value, subtitle, icon, color }) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        red: "bg-red-50 text-red-600 border-red-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
                <p className="text-sm font-semibold text-slate-600 mt-1">{title}</p>
                <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            </div>
        </div>
    );
}

function MetricProgressBar({ label, percentage, color }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="text-slate-500">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
                <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
}

function DatabaseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
    );
}

export default Analytics;
