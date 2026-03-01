import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FileText, Eye, MapPin, Clock, Tag } from 'lucide-react';

function Complaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const complaintsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComplaints(complaintsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching complaints: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleViewEvidence = (telegramMessageId) => {
        if (!telegramMessageId) {
            alert("No Telegram Evidence Linked.");
            return;
        }
        // Redirecting to Telegram web/desktop client to view the evidence in the private safeguarded group.
        // We strip the '-' sign if presenting as a typical public link fallback, 
        // but typically private group links are t.me/c/<id>/<msgId>
        const chatIdForLink = "5182109956";
        window.open(`https://t.me/c/${chatIdForLink}/${telegramMessageId}`, '_blank');
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Vault Complaints & Live Evidence...</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                        <FileText className="mr-3 text-blue-600" /> Live Evidence Vault
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Real-time complaints and stealth recordings submitted from the SafeGuard mobile app.</p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium text-sm flex items-center border border-blue-200 shadow-sm">
                    <span className="flex h-2.5 w-2.5 mr-2 rounded-full bg-blue-600 animate-pulse"></span>
                    {complaints.length} Records Secured
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complaints.map(complaint => (
                    <div key={complaint.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                    <Tag className="w-3 h-3 mr-1" /> {complaint.tag || 'Emergency'}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(complaint.createdAt).toLocaleString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900 mb-2 truncate">{complaint.title || 'Untitled Report'}</h3>
                            <p className="text-sm text-slate-600 mb-4 line-clamp-3">{complaint.description || 'No description provided.'}</p>

                            <div className="flex items-center text-xs text-slate-500 mb-4">
                                <MapPin className="w-3.5 h-3.5 mr-1" />
                                {complaint.location ? `Coords: ${complaint.location}` : 'Location Unavailable'}
                            </div>
                        </div>

                        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-500">ID: {complaint.userId?.substring(0, 8) || 'Unknown'}...</span>

                            <button
                                onClick={() => handleViewEvidence(complaint.telegramMessageId)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
                            >
                                <Eye className="w-4 h-4 mr-1.5" />
                                View Evidence
                            </button>
                        </div>
                    </div>
                ))}

                {complaints.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-xl">
                        <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-sm font-medium text-slate-900">No Complaints Found</h3>
                        <p className="mt-1 text-sm text-slate-500">The evidence vault is currently secure and empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Complaints;
