import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FileText, Eye, MapPin, Clock, Tag, User, Phone, PlayCircle, X, Trash2 } from 'lucide-react';

function Complaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    // Video streaming state
    const [activeVideoUrl, setActiveVideoUrl] = useState(null);
    const [isLoadingVideo, setIsLoadingVideo] = useState(false);

    const TELEGRAM_CHAT_ID = "-5182109956"; // Vault Group ID

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

    const handlePlayInlineVideo = async (fileId) => {
        if (!fileId) {
            alert("This evidence relies on an older schema or is missing a Video File ID.");
            return;
        }

        setIsLoadingVideo(true);
        setActiveVideoUrl(null);

        try {
            // Step 1: Request the file path from Telegram
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
            const data = await response.json();

            if (data.ok) {
                // Step 2: Construct the secure Telegram Download URL
                const filePath = data.result.file_path;
                const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;

                setActiveVideoUrl(downloadUrl);
            } else {
                alert("Telegram Stream Error: " + data.description);
            }
        } catch (error) {
            console.error("Failed to fetch stream", error);
            alert("Network error while trying to fetch video from Telegram.");
        } finally {
            setIsLoadingVideo(false);
        }
    };

    const handleDeleteComplaint = async (docId, telegramMessageId) => {
        if (!window.confirm("Are you sure you want to permanently delete this evidence from the Vault and Telegram records? This cannot be undone.")) {
            return;
        }

        try {
            // 1. Delete from Firestore metadata
            await deleteDoc(doc(db, 'complaints', docId));

            // 2. Delete the actual video from Telegram Cloud Storage
            if (telegramMessageId) {
                const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        message_id: telegramMessageId
                    })
                });

                const data = await response.json();
                if (!data.ok) {
                    console.error("Failed to wipe Telegram video. Document deleted, but Video might remain.", data);
                }
            }
        } catch (error) {
            console.error("Error destroying evidence:", error);
            alert("Failed to destroy evidence database records.");
        }
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {complaints.map(complaint => (
                    <div key={complaint.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 uppercase tracking-wider">
                                    <Tag className="w-3 h-3 mr-1" /> {complaint.tag || 'Emergency'}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(complaint.createdAt).toLocaleString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900 mb-2 truncate">{complaint.title || 'Untitled Report'}</h3>
                            <p className="text-sm text-slate-600 mb-4 line-clamp-3">{complaint.description || 'No description provided.'}</p>

                            <div className="flex items-center text-xs text-slate-500 mb-2 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                {complaint.location ? `Coords: ${complaint.location}` : 'Location Unavailable'}
                            </div>

                            <div className="flex items-center text-sm text-slate-700 font-medium">
                                <User className="w-4 h-4 mr-2 text-slate-400" />
                                {complaint.userName || 'Anonymous User'}
                            </div>
                            <div className="flex items-center text-sm text-slate-600 mt-1">
                                <Phone className="w-4 h-4 mr-2 text-slate-400" />
                                {complaint.userPhone || 'No Phone Registered'}
                            </div>
                        </div>

                        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex justify-between items-center mt-auto">
                            <span className="text-xs font-mono text-slate-400" title={complaint.userId}>ID: {complaint.userId?.substring(0, 8) || 'Unknown'}</span>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDeleteComplaint(complaint.id, complaint.telegramMessageId)}
                                    className="inline-flex items-center px-3 py-2 border border-slate-200 text-sm font-semibold rounded-lg shadow-sm text-slate-600 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 focus:outline-none transition-colors"
                                    title="Erase Details & Video"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handlePlayInlineVideo(complaint.telegramFileId)}
                                    disabled={isLoadingVideo}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    {isLoadingVideo ? (
                                        <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span> Buffering...</span>
                                    ) : (
                                        <><PlayCircle className="w-5 h-5 mr-1.5" /> Play Evidence</>
                                    )}
                                </button>
                            </div>
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

            {/* In-browser Telegram Video Player Modal */}
            {activeVideoUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl border border-slate-700 flex flex-col">
                        <div className="px-4 py-3 bg-slate-800 flex justify-between items-center border-b border-slate-700">
                            <h3 className="text-white font-semibold flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-red-400" />
                                Secure Evidence Channel
                            </h3>
                            <button
                                onClick={() => setActiveVideoUrl(null)}
                                className="text-slate-400 hover:text-white bg-slate-700 hover:bg-red-500 rounded-full p-1 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative bg-black w-full aspect-video flex items-center justify-center">
                            <video
                                src={activeVideoUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                                controlsList="nodownload noplaybackrate"
                                disablePictureInPicture
                            >
                                Your browser does not support playing this emergency evidence.
                            </video>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Complaints;
