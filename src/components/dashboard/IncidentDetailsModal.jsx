import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { X, Image as ImageIcon, Mic, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function IncidentDetailsModal({ incident, onClose }) {
    const [evidence, setEvidence] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!incident) return;

        const fetchEvidence = async () => {
            try {
                // Fetch from the 'evidence' collection where incidentId matches
                const q = query(
                    collection(db, 'evidence'),
                    where('incidentId', '==', incident.id),
                    // Note: If you don't have a composite index in Firestore for incidentId + uploadedAt desc, 
                    // removing the orderBy here might be safer to prevent index errors, or we handle sorting locally.
                );

                const snapshot = await getDocs(q);
                let fetchedEvidence = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Sort locally to avoid needing a composite Firebase index
                fetchedEvidence.sort((a, b) => {
                    const timeA = a.uploadedAt?.toDate?.() || new Date(0);
                    const timeB = b.uploadedAt?.toDate?.() || new Date(0);
                    return timeB - timeA;
                });

                // Fetch victim's Emergency Contacts (Guardians)
                try {
                    const contactsQuery = query(collection(db, 'users', incident.userUid, 'contacts'));
                    const contactsSnap = await getDocs(contactsQuery);
                    const fetchedContacts = contactsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setContacts(fetchedContacts);
                } catch (err) {
                    console.error("Failed to load contacts:", err);
                }

                setEvidence(fetchedEvidence);
            } catch (error) {
                console.error("Error fetching evidence:", error);
                toast.error("Failed to load evidence files.");
            } finally {
                setLoading(false);
            }
        };

        fetchEvidence();
    }, [incident]);

    if (!incident) return null;

    const images = evidence.filter(e => e.type === 'image' || e.type === 'photo');
    const audioClips = evidence.filter(e => e.type === 'audio');

    // Fallback safe date parsing
    const dateObj = incident.createdAt instanceof Date ? incident.createdAt : (incident.createdAt?.toDate?.() || new Date());
    const formattedDate = dateObj.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">SOS Incident Report #{incident.id.substring(0, 8).toUpperCase()}</h2>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
                            <span className={`px-2 py-0.5 rounded-md \${incident.status === 'Active' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {incident.status}
                            </span>
                            <span>•</span>
                            <span>{formattedDate}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-6 flex-1 overflow-y-auto space-y-8">

                    {/* Reporter Metadata */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                            <FileText size={18} className="text-slate-500" />
                            <h3 className="font-semibold text-slate-700">Dispatch Details</h3>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-1">Reporter ID</p>
                                <p className="text-slate-800 font-semibold">{incident.userId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-1">Contact Email</p>
                                <p className="text-slate-800 font-semibold">{incident.userEmail || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-1">Phone Number</p>
                                <p className="text-slate-800 font-semibold">{incident.userPhone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-1">Assessed Risk Score</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500" style={{ width: `\${(incident.riskScore / 10) * 100}%` }}></div>
                                    </div>
                                    <p className="text-slate-800 font-bold">{incident.riskScore} / 10</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-1">Assigned Station / Jurisdiction</p>
                                <p className="text-slate-800 font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block">
                                    {incident.assignedStationName || 'Calculating Jurisdiction...'}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-slate-500 font-medium mb-1">Emergency Location</p>
                                <div className="bg-slate-100 p-3 rounded-lg font-mono text-sm text-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-2 border border-slate-200">
                                    <div>
                                        <span className="font-bold text-slate-800 font-sans block mb-1">{incident.address || 'Address not resolved'}</span>
                                        <span className="text-xs text-slate-500">Lat: {incident.location?.latitude?.toFixed(6) || 'Unknown'} , Lng: {incident.location?.longitude?.toFixed(6) || 'Unknown'}</span>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=\${incident.location?.latitude},\${incident.location?.longitude}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline font-sans text-xs font-bold whitespace-nowrap bg-blue-50 px-3 py-1.5 rounded-md"
                                    >
                                        OPEN IN MAPS
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Investigation Evidence Section */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            Digital Evidence Room
                            {loading && <Loader2 size={16} className="animate-spin text-blue-500" />}
                            {!loading && evidence.length > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold ml-2">
                                    {evidence.length} FILES
                                </span>
                            )}
                        </h3>

                        {!loading && evidence.length === 0 && !incident.evidenceUrl && (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-3">
                                    <X size={24} />
                                </div>
                                <h4 className="text-slate-700 font-semibold">No Evidence Attached</h4>
                                <p className="text-slate-500 text-sm mt-1 max-w-sm">The victim did not upload any photos or audio recordings during this emergency sequence.</p>
                            </div>
                        )}

                        {/* Photographic Evidence Grid */}
                        {(images.length > 0 || incident.evidenceUrl || incident.evidenceUrlBack) && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold">
                                    <ImageIcon size={18} className="text-blue-500" /> Captured Photos
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Auto-Captured Front Photo */}
                                    {incident.evidenceUrl && (
                                        <div className="group relative aspect-video bg-slate-100 rounded-lg overflow-hidden border-2 border-red-200">
                                            <img
                                                src={incident.evidenceUrl}
                                                alt="Front Camera"
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent flex items-end p-3">
                                                <div className="flex flex-col">
                                                    <span className="text-red-300 text-[10px] font-bold tracking-wider animate-pulse flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
                                                        AUTO-CAPTURED
                                                    </span>
                                                    <p className="text-white text-xs font-semibold truncate mt-0.5">FRONT SENSOR</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Auto-Captured Back Photo */}
                                    {incident.evidenceUrlBack && (
                                        <div className="group relative aspect-video bg-slate-100 rounded-lg overflow-hidden border-2 border-blue-200">
                                            <img
                                                src={incident.evidenceUrlBack}
                                                alt="Back Camera"
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-3">
                                                <div className="flex flex-col">
                                                    <span className="text-blue-300 text-[10px] font-bold tracking-wider animate-pulse flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block"></span>
                                                        AUTO-CAPTURED
                                                    </span>
                                                    <p className="text-white text-xs font-semibold truncate mt-0.5">REAR SENSOR</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Manually Attached Evidence Files */}
                                    {images.map(img => (
                                        <div key={img.id} className="group relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                            <img
                                                src={img.fileUrl}
                                                alt={img.title || "Evidence"}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                <p className="text-white text-xs font-medium truncate">{img.title || 'Photo Evidence'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Audio Evidence List */}
                        {audioClips.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold">
                                    <Mic size={18} className="text-red-500" /> Audio Intercepts
                                </div>
                                <div className="space-y-3">
                                    {audioClips.map(audio => (
                                        <div key={audio.id} className="bg-white border text-sm border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-slate-300 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                                    <Mic size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-700 truncate">{audio.title || 'Secret Audio Recording'}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">{audio.sizeStr || 'Audio File'}</p>
                                                </div>
                                            </div>
                                            <audio controls src={audio.fileUrl} className="h-10 w-full sm:w-64 flex-shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Victim's Emergency Contacts (Guardians) */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
                        <div className="px-5 py-3 border-b border-slate-100 bg-red-50 sm:bg-slate-50 flex justify-between items-center gap-2">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="m19 8 2 2 4-4"></path></svg>
                                <h3 className="font-semibold text-slate-800">Trusted Emergency Contacts</h3>
                            </div>
                            <span className="text-xs font-bold text-slate-500">{contacts.length} RECORDED</span>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-slate-400">Scanning police databases...</div>
                        ) : contacts.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 italic text-sm">
                                This user has not registered any family members or trusted contacts.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {contacts.map(contact => (
                                    <div key={contact.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                        <div>
                                            <p className="font-bold text-slate-800 text-lg">{contact.name}</p>
                                            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{contact.relation || 'Guardian'}</p>
                                        </div>
                                        <a
                                            href={`tel:\${contact.phone}`}
                                            className="flex items-center justify-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-900 transition-colors shadow-sm"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                            Call {contact.phone}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IncidentDetailsModal;
