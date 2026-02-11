"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDoctors: 0,
        pendingVerifications: 0,
        aiPostsGenerated: 0 // Placeholder or fetch if possible
    });

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch all users
                const usersSnap = await getDocs(collection(db, "users"));
                const totalUsers = usersSnap.size;

                let totalDoctors = 0;
                let pendingVerifications = 0;

                usersSnap.forEach(doc => {
                    const data = doc.data();
                    if (data.role === 'doctor') {
                        totalDoctors++;
                        if (!data.isVerified) {
                            pendingVerifications++;
                        }
                    }
                });

                setStats({
                    totalUsers,
                    totalDoctors,
                    pendingVerifications,
                    aiPostsGenerated: 0 // connect to backend later if needed
                });

            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        }

        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
                <p className="text-zinc-400 mt-2">Welcome to the Docent Admin Panel.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-400">Total Users</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
                </div>
                <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-400">Total Doctors</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.totalDoctors}</p>
                </div>
                <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-400">Pending Verifications</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.pendingVerifications}</p>
                </div>
                <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-400">AI Posts Generated</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.aiPostsGenerated}</p>
                </div>
            </div>
        </div>
    );
}
