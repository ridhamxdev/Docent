"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/context/AuthContext";
import { Check, X, FileText } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

const API_BASE_URL = "http://localhost:5555"; // Backend URL for static files

export default function VerificationsPage() {
    const [pendingdentists, setPendingdentists] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingdentists();
    }, []);

    async function fetchPendingdentists() {
        try {
            // Query all unverified users (role is 'dentist' or 'student', NOT 'dentist')
            const q = query(
                collection(db, "users"),
                where("isVerified", "==", false)
            );

            const querySnapshot = await getDocs(q);
            const users: User[] = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data() as User;
                // Only show dentists and students (not patients)
                if (data.role === 'dentist' || data.role === 'student') {
                    users.push(data);
                }
            });
            setPendingdentists(users);
        } catch (error) {
            console.error("Error fetching pending users:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleVerify(uid: string) {
        if (!confirm("Are you sure you want to verify this dentist?")) return;

        try {
            // Secure backend call
            await apiClient.put(`/admin/users/${uid}/verify`, { isVerified: true });

            // Update local state
            setPendingdentists(prev => prev.filter(doc => doc.uid !== uid));
        } catch (error) {
            console.error("Error verifying dentist:", error);
            alert("Failed to verify dentist. Check console.");
        }
    }

    async function handleReject(uid: string) {
        if (!confirm("Are you sure you want to REJECT this application? This will delete the user account.")) return;

        try {
            // Secure backend delete
            await apiClient.delete(`/admin/users/${uid}`);
            setPendingdentists(prev => prev.filter(doc => doc.uid !== uid));
        } catch (error) {
            console.error("Error rejecting dentist:", error);
            alert("Failed to reject application.");
        }
    }

    function getDocumentLink(url?: string) {
        if (!url) return "#";
        if (url.startsWith("http")) return url;
        return `${API_BASE_URL}${url}`;
    }

    if (loading) {
        return <div className="text-white">Loading pending verifications...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Professional Verification</h1>
            <p className="text-zinc-400">Review documents and approve dentist & student accounts.</p>

            {pendingdentists.length === 0 ? (
                <div className="p-8 rounded-xl bg-zinc-900 border border-zinc-800 text-center text-zinc-500">
                    No pending verifications found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingdentists.map((dentist) => (
                        <div key={dentist.uid} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-white text-lg">{dentist.displayName || "No Name"}</h3>
                                    <p className="text-zinc-400 text-sm">{dentist.email}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full uppercase font-medium ${dentist.role === 'dentist'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'bg-teal-500/10 text-teal-400'
                                    }`}>
                                    {dentist.role === 'dentist' ? 'Dentist' : 'Student'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-zinc-300">
                                {dentist.role === 'dentist' ? (
                                    <>
                                        <div className="flex justify-between">
                                            <span>Qualification:</span>
                                            <span className="font-medium text-white">{dentist.qualification || dentist.qualifications || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Specialization:</span>
                                            <span className="font-medium text-white">{dentist.specialization || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Experience:</span>
                                            <span className="font-medium text-white">{dentist.experience || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Clinic:</span>
                                            <span className="font-medium text-white">{dentist.clinicAddress || "N/A"}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between">
                                            <span>College:</span>
                                            <span className="font-medium text-white">{dentist.collegeName || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Year:</span>
                                            <span className="font-medium text-white">{dentist.yearOfStudy || "N/A"}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="pt-2 border-t border-zinc-800">
                                <p className="text-xs text-zinc-500 mb-2">Verification Document</p>
                                {dentist.documentUrl ? (
                                    <a
                                        href={getDocumentLink(dentist.documentUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-blue-400 text-sm hover:underline"
                                    >
                                        <FileText className="w-4 h-4" />
                                        View Document
                                    </a>
                                ) : (
                                    <span className="text-red-400 text-xs">No Document Uploaded</span>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => handleVerify(dentist.uid)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Verify
                                </button>
                                <button
                                    onClick={() => handleReject(dentist.uid)}
                                    className="flex-1 bg-zinc-800 hover:bg-red-900/50 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 hover:text-red-400"
                                >
                                    <X className="w-4 h-4" /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
