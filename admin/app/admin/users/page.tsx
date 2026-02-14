"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/context/AuthContext";
import { Trash2, Pencil, X, Check, Search } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("dentist");

    // Search & Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Edit Modal State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState<Partial<User>>({});

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let result = users;

        // 1. Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(u =>
                (u.displayName?.toLowerCase() || "").includes(lowerTerm) ||
                (u.email?.toLowerCase() || "").includes(lowerTerm)
            );
        }

        // 2. Tab Filter
        if (activeTab !== "all") {
            result = result.filter((u) => u.role === activeTab);
        }

        setFilteredUsers(result);
        setCurrentPage(1); // Reset validation
    }, [activeTab, users, searchTerm]);

    async function fetchUsers() {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const fetchedUsers: User[] = [];
            querySnapshot.forEach((doc) => {
                fetchedUsers.push(doc.data() as User);
            });
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(uid: string, role?: string) {
        if (!confirm(`Are you sure you want to delete this ${role || "user"}? This action cannot be undone.`)) return;

        try {
            // Use Backend Admin API to delete from Auth AND Firestore
            await apiClient.delete(`/admin/users/${uid}`);

            // Update local state
            setUsers((prev) => prev.filter((u) => u.uid !== uid));
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        }
    }

    function openEditModal(user: User) {
        setEditingUser(user);
        setEditForm({
            displayName: user.displayName,
            role: user.role,
            isVerified: user.isVerified,
            // Add other fields if needed
        });
    }

    async function handleUpdateUser() {
        if (!editingUser) return;

        try {
            // Update Role via Backend (if changed)
            if (editForm.role && editForm.role !== editingUser.role) {
                await apiClient.put(`/admin/users/${editingUser.uid}/role`, { role: editForm.role });
            }

            // Update Verification via Backend (if changed)
            if (editForm.isVerified !== undefined && editForm.isVerified !== editingUser.isVerified) {
                await apiClient.put(`/admin/users/${editingUser.uid}/verify`, { isVerified: editForm.isVerified });
            }

            // Update Display Name (Direct Firestore update as it's a profile field)
            if (editForm.displayName && editForm.displayName !== editingUser.displayName) {
                const userRef = doc(db, "users", editingUser.uid);
                await updateDoc(userRef, { displayName: editForm.displayName });
            }

            // Update local state
            setUsers(prev =>
                prev.map(u => u.uid === editingUser.uid ? { ...u, ...editForm } : u)
            );
            setEditingUser(null);
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user.");
        }
    }

    if (loading) {
        return <div className="text-white">Loading users...</div>;
    }

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-white">User Management</h1>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg pl-10 pr-4 py-2 w-full sm:w-64 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600"
                    />
                </div>

                {/* Tabs */}
                <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg overflow-x-auto">
                    {['dentist', 'student', 'patient'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize whitespace-nowrap ${activeTab === tab
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {tab} <span className="text-xs opacity-50 ml-1">
                                {users.filter(u => u.role === tab).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-950 text-zinc-200 uppercase font-medium border-b border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                {activeTab !== 'patient' && <th className="px-6 py-4">Status</th>}
                                <th className="px-6 py-4">Signed Up</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                        No users found in this category.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers
                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                    .map((user) => (
                                        <tr key={user.uid} className="hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">
                                                {user.displayName || "N/A"}
                                            </td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.role === "admin"
                                                        ? "bg-purple-500/10 text-purple-400"
                                                        : ((user.role as string) === "dentist" || user.role === "dentist")
                                                            ? "bg-blue-500/10 text-blue-400"
                                                            : user.role === "student"
                                                                ? "bg-teal-500/10 text-teal-400"
                                                                : "bg-pink-500/10 text-pink-400"
                                                        }`}
                                                >
                                                    {user.role === 'dentist' ? 'Dentist (Legacy)' : user.role}
                                                </span>
                                            </td>
                                            {activeTab !== 'patient' && (
                                                <td className="px-6 py-4">
                                                    {((user.role as string) === "dentist" || user.role === "student") ? (
                                                        user.isVerified ? (
                                                            <div className="flex items-center gap-1.5 text-green-400">
                                                                <Check className="w-3.5 h-3.5" /> Verified
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 text-amber-400">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Pending
                                                            </div>
                                                        )
                                                    ) : (
                                                        <span className="text-zinc-600">-</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                {/* @ts-ignore */}
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-2 rounded-full transition-colors mr-2"
                                                    title="Edit User"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.uid, user.role)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-full transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredUsers.length > itemsPerPage && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
                        <div className="text-sm text-zinc-500">
                            Showing <span className="text-white font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-white font-medium">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="text-white font-medium">{filteredUsers.length}</span> results
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), p + 1))}
                                disabled={currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)}
                                className="px-3 py-1 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/50">
                            <h3 className="font-bold text-white text-lg">Edit User Details</h3>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Display Name</label>
                                <input
                                    type="text"
                                    value={editForm.displayName || ""}
                                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Role</label>
                                <select
                                    value={editForm.role}
                                    // @ts-ignore
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                                >
                                    <option value="patient">Patient</option>
                                    <option value="student">Student</option>
                                    <option value="dentist">Dentist</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {((editForm.role as string) === 'dentist' || editForm.role === 'dentist' || editForm.role === 'student') && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                                    <input
                                        type="checkbox"
                                        id="verify"
                                        checked={editForm.isVerified || false}
                                        onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                                        className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900"
                                    />
                                    <label htmlFor="verify" className="text-zinc-300 font-medium cursor-pointer select-none">
                                        Verified Status
                                    </label>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateUser}
                                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all font-medium"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
