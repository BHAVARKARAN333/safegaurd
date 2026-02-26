import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const IncidentContext = createContext();
export const useIncidents = () => useContext(IncidentContext);

export const IncidentProvider = ({ children }) => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const prevCountRef = useRef(0);

    useEffect(() => {
        // Only run if user is logged in
        if (!user) {
            setIncidents([]);
            setLoading(false);
            return;
        }

        try {
            console.log("Connecting to Real Firebase Incidents...");
            const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                console.log(`Received ${snapshot.docs.length} real incident documents from Firebase`);
                const liveData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    console.log(`Raw Incident [${doc.id}]:`, data);

                    // Normalize Flutter Firebase Data to Web format
                    // Flutter sends status as 'active' (lowercase), web expects 'Active' (Titlecase)
                    let normalizedStatus = "Active";
                    if (data.status) {
                        normalizedStatus = data.status.charAt(0).toUpperCase() + data.status.slice(1);
                    }

                    // Flutter sends GeoPoint objects, extractlat/lng defensively
                    let normalizedLocation = null;
                    if (data.location && typeof data.location.latitude !== 'undefined') {
                        normalizedLocation = {
                            latitude: data.location.latitude,
                            longitude: data.location.longitude
                        };
                    } else if (data.lat && data.lng) { // Handle cases where lat/lng might be direct properties
                        normalizedLocation = {
                            latitude: data.lat,
                            longitude: data.lng
                        };
                    }

                    return {
                        id: doc.id,
                        userId: data.userName || data.userId || "Mobile App User",
                        userUid: data.userId, // Preserving the raw Auth UID to query subcollections
                        userEmail: data.userEmail || "N/A",
                        userPhone: data.userPhone || "N/A",
                        address: data.address || "Address not resolved",
                        assignedStationName: data.assignedStationName || "Calculating Jurisdiction...",
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                        location: normalizedLocation,
                        status: normalizedStatus,
                        riskScore: data.riskScore || 5,
                        evidenceUrl: data.evidenceUrl || null,
                        evidenceUrlBack: data.evidenceUrlBack || null
                    };
                });

                console.log("Processed Incident Data:", liveData);

                // Toast Notification Logic
                const currentActiveCount = liveData.filter(i => i.status === 'Active').length;

                // If this isn't the first load, and the active count increased natively
                if (prevCountRef.current > 0 && liveData.length > prevCountRef.current) {
                    const newestIncident = liveData[0]; // because it's ordered by createdAt desc
                    if (newestIncident.status === 'Active') {
                        toast.error(
                            <div>
                                <p className="font-bold text-sm">Critical SOS Alert!</p>
                                <p className="text-xs mt-1">{newestIncident.userId} requires immediate dispatch.</p>
                            </div>,
                            {
                                duration: 8000,
                                style: { background: '#ef4444', color: '#fff', border: '1px solid #7f1d1d' }
                            }
                        );
                    }
                }

                prevCountRef.current = liveData.length;
                setIncidents(liveData);
                setLoading(false);
            }, (error) => {
                console.error("Error listening to real incidents:", error);
                // Fallback for demo if the database is completely empty or missing indexes
                setIncidents([
                    { id: "demo-1", status: "Active", userId: "Emergency Fallback", location: { latitude: 19.1136, longitude: 72.8697 }, createdAt: new Date() }
                ]);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Failed to set up incident listener:", error);
            setIncidents([
                { id: "demo-fallback", status: "Active", userId: "Setup Error Fallback", location: { latitude: 19.1136, longitude: 72.8697 }, createdAt: new Date() }
            ]);
            setLoading(false);
        }
    }, [user]);

    const updateIncidentStatus = async (incidentId, newStatus) => {
        try {
            const incidentRef = doc(db, 'incidents', incidentId);
            await updateDoc(incidentRef, { status: newStatus });
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    return (
        <IncidentContext.Provider value={{ incidents, loading, updateIncidentStatus }}>
            {children}
        </IncidentContext.Provider>
    );
};
