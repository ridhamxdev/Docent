"use client";

import { useEffect, useState } from "react";
import { Trash2, RefreshCw, BarChart3 } from "lucide-react";

interface PostStats {
    total: number;
    byRole: {
        dentist: number;
        student: number;
        patient: number;
        ai: number;
    };
    withMedia: number;
    textOnly: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

export default function FeedManagementPage() {
    const [stats, setStats] = useState<PostStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/posts/admin/stats`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAllExceptAI = async () => {
        const nonAIPosts = (stats?.total || 0) - (stats?.byRole.ai || 0);

        if (!confirm(`This will delete ${nonAIPosts} user posts.\n\n✅ Only Docent AI posts will be KEPT\n❌ ALL user posts will be deleted (including media)\n\nThis action cannot be undone. Continue?`)) {
            return;
        }

        try {
            setDeleting(true);
            const res = await fetch(`${API_URL}/posts/admin/bulk`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keepAI: true, keepWithMedia: false })
            });
            const result = await res.json();

            alert(`Deleted ${result.deletedCount} posts out of ${result.totalScanned} total posts.`);
            await fetchStats();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete posts');
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteTextOnly = async () => {
        if (!confirm(`This will delete ${stats?.textOnly || 0} text-only posts.\n\n✅ AI posts will be KEPT\n✅ Posts with media will be KEPT\n\nThis action cannot be undone. Continue?`)) {
            return;
        }

        try {
            setDeleting(true);
            const res = await fetch(`${API_URL}/posts/admin/bulk`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keepAI: true, keepWithMedia: true })
            });
            const result = await res.json();

            alert(`Deleted ${result.deletedCount} posts out of ${result.totalScanned} total posts.`);
            await fetchStats();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete posts');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Feed Management</h1>
                <p className="text-zinc-400 mt-2">Manage posts and content across the platform.</p>
            </div>

            {/* Stats Grid */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                    <h2 className="text-xl font-bold text-white">Post Statistics</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-black rounded-lg border border-zinc-800">
                        <p className="text-sm text-zinc-400">Total Posts</p>
                        <p className="text-2xl font-bold text-white mt-1">{stats?.total || 0}</p>
                    </div>
                    <div className="p-4 bg-black rounded-lg border border-zinc-800">
                        <p className="text-sm text-zinc-400">🦷 Dentist</p>
                        <p className="text-2xl font-bold text-white mt-1">{stats?.byRole.dentist || 0}</p>
                    </div>
                    <div className="p-4 bg-black rounded-lg border border-zinc-800">
                        <p className="text-sm text-zinc-400">🎓 Student</p>
                        <p className="text-2xl font-bold text-white mt-1">{stats?.byRole.student || 0}</p>
                    </div>
                    <div className="p-4 bg-black rounded-lg border border-zinc-800">
                        <p className="text-sm text-zinc-400">👤 Patient</p>
                        <p className="text-2xl font-bold text-white mt-1">{stats?.byRole.patient || 0}</p>
                    </div>
                    <div className="p-4 bg-black rounded-lg border border-zinc-800">
                        <p className="text-sm text-zinc-400">🤖 AI Posts</p>
                        <p className="text-2xl font-bold text-white mt-1">{stats?.byRole.ai || 0}</p>
                    </div>
                    <div className="p-4 bg-black rounded-lg border border-zinc-800">
                        <p className="text-sm text-zinc-400">📷 With Media</p>
                        <p className="text-2xl font-bold text-green-500 mt-1">{stats?.withMedia || 0}</p>
                    </div>
                    <div className="p-4 bg-black rounded-lg border border-zinc-800">
                        <p className="text-sm text-zinc-400">📝 Text Only</p>
                        <p className="text-2xl font-bold text-orange-500 mt-1">{stats?.textOnly || 0}</p>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Trash2 className="w-6 h-6 text-red-400" />
                    <h2 className="text-xl font-bold text-white">Bulk Actions</h2>
                </div>

                <div className="space-y-4">
                    {/* Delete All User Posts */}
                    <div className="p-4 bg-red-950/30 border border-red-900 rounded-lg">
                        <h3 className="font-semibold text-red-400 mb-2">🗑️ Delete All User Posts</h3>
                        <ul className="text-sm text-red-300 space-y-1 mb-4">
                            <li>• Removes ALL user posts (dentists, students, patients)</li>
                            <li>• Includes posts with images/videos</li>
                            <li className="mt-2">✅ Keeps: Docent AI posts only</li>
                        </ul>
                        <button
                            onClick={handleDeleteAllExceptAI}
                            disabled={deleting || ((stats?.total || 0) - (stats?.byRole.ai || 0)) === 0}
                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {deleting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete All {(stats?.total || 0) - (stats?.byRole.ai || 0)} User Posts
                                </>
                            )}
                        </button>
                    </div>

                    {/* Delete Text-Only Posts */}
                    <div className="p-4 bg-orange-950/30 border border-orange-900 rounded-lg">
                        <h3 className="font-semibold text-orange-400 mb-2">⚠️ Delete Text-Only Posts</h3>
                        <ul className="text-sm text-orange-300 space-y-1 mb-4">
                            <li>• Text-only posts from users</li>
                            <li className="mt-2">✅ Keeps: AI posts & posts with media</li>
                        </ul>
                        <button
                            onClick={handleDeleteTextOnly}
                            disabled={deleting || (stats?.textOnly || 0) === 0}
                            className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {deleting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Clear {stats?.textOnly || 0} Text-Only Posts
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Refresh Button */}
            <button
                onClick={fetchStats}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
                <RefreshCw className="w-4 h-4" />
                Refresh Statistics
            </button>
        </div>
    );
}
