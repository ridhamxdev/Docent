"use client";

import { useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Save, Upload, User as UserIcon, Trash2, Plus, Image as ImageIcon, Sparkles, LayoutList, Pencil, X } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

type Post = {
    id: string;
    content: string;
    image?: string;
    createdAt: number;
    author: string;
    authorType: string;
};

export default function DocentAIPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "posts">("profile");

    // Profile State
    const [formData, setFormData] = useState({
        displayName: "Docent AI",
        bio: "Your personal AI dental assistant.",
        photoURL: "",
        role: "admin",
        isVerified: true
    });
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Posts State
    const [posts, setPosts] = useState<Post[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postContent, setPostContent] = useState("");
    const [postImage, setPostImage] = useState("");
    const [publishing, setPublishing] = useState(false);
    const [uploadingPostImage, setUploadingPostImage] = useState(false);

    // Edit Mode State
    const [editingPostId, setEditingPostId] = useState<string | null>(null);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const postImageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchDocentProfile();
    }, []);

    useEffect(() => {
        if (activeTab === "posts") {
            fetchPosts();
        }
    }, [activeTab]);

    async function fetchDocentProfile() {
        try {
            const docRef = doc(db, "users", "docent-ai");
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) {
                const data = snapshot.data();
                setFormData(prev => ({ ...prev, ...data }));
            } else {
                const defaultData = {
                    displayName: "Docent AI",
                    bio: "Your personal AI dental assistant.",
                    photoURL: "",
                    role: "admin",
                    isVerified: true,
                    uid: "docent-ai"
                };
                await setDoc(docRef, defaultData);
                setFormData(defaultData);
            }
        } catch (error) {
            console.error("Error fetching Docent AI profile:", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchPosts() {
        setPostsLoading(true);
        try {
            const data = await apiClient.get("/posts");
            if (Array.isArray(data)) {
                // Filter for posts by "Docent AI" or the current custom name
                const aiPosts = data.filter((p: Post) =>
                    p.author === "Docent AI" ||
                    p.author === formData.displayName ||
                    p.authorType === 'ai'
                );
                setPosts(aiPosts);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setPostsLoading(false);
        }
    }

    /* ---------------- UPLOAD HANDLER (S3) ---------------- */
    async function uploadFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await apiClient.post('/upload', formData);
            // apiClient.post might expect JSON by default if configured with headers? 
            // If apiClient forces JSON, we might need standard fetch for multipart.
            // Let's assume apiClient handles FormData correctly or use fetch if it fails.
            // Actually, safe bet is standard fetch for upload if client logic is strict.

            // Standard Fetch fallback for upload to be safe
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(data.error);
            return data.url;
        } catch (e) {
            console.error("Upload failed", e);
            alert("Upload failed. Please try again.");
            return null;
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadingAvatar(true);
            const url = await uploadFile(file);
            setUploadingAvatar(false);
            if (url) {
                setFormData(prev => ({ ...prev, photoURL: url }));
            }
        }
    };

    const handlePostImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadingPostImage(true);
            const url = await uploadFile(file);
            setUploadingPostImage(false);
            if (url) {
                setPostImage(url);
            }
        }
    };

    /* ---------------- ACTIONS ---------------- */
    async function handleSaveProfile() {
        setSaving(true);
        try {
            let finalPhotoURL = formData.photoURL;

            // CHECK CACHE/BASE64 ISSUE
            // If the photoURL is a base64 string (huge payload), upload it first
            if (finalPhotoURL && finalPhotoURL.startsWith('data:image')) {
                console.log("Detecting Base64 image, converting...");
                try {
                    // Convert Base64 to Blob
                    const fetchRes = await fetch(finalPhotoURL);
                    const blob = await fetchRes.blob();
                    const file = new File([blob], "avatar.png", { type: "image/png" });

                    // Upload
                    console.log("Uploading converted file...");
                    const s3Url = await uploadFile(file);
                    if (s3Url) {
                        finalPhotoURL = s3Url;
                        setFormData(prev => ({ ...prev, photoURL: s3Url })); // Update local state
                    }
                } catch (e) {
                    console.error("Failed to convert/upload base64 avatar", e);
                }
            }

            const docRef = doc(db, "users", "docent-ai");
            await setDoc(docRef, {
                ...formData,
                photoURL: finalPhotoURL,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            // Sync all past posts
            const syncRes = await fetch('/api/admin/sync-docent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.displayName,
                    photo: finalPhotoURL
                })
            });

            if (!syncRes.ok) {
                const errText = await syncRes.text();
                console.error('Sync failed:', errText);
                // Don't throw, just warn, as profile is saved
                alert("Profile saved, but post sync failed: " + errText);
            } else {
                alert("Profile updated and all posts synced successfully!");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    }

    async function handleSubmitPost() {
        if (!postContent.trim()) return;
        setPublishing(true);
        try {
            if (editingPostId) {
                // EDIT
                await apiClient.put(`/posts/${editingPostId}`, {
                    content: postContent,
                    image: postImage
                });
                setEditingPostId(null);
            } else {
                // CREATE
                await apiClient.post("/posts", {
                    content: postContent,
                    image: postImage,
                    author: formData.displayName,
                    authorType: "ai",
                    authorRole: "admin",
                    authorPhoto: formData.photoURL
                });
            }

            // Reset
            setPostContent("");
            setPostImage("");
            fetchPosts();
        } catch (error) {
            console.error("Error submitting post:", error);
            alert("Failed to subit post.");
        } finally {
            setPublishing(false);
        }
    }

    async function handleDeletePost(id: string) {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await apiClient.delete(`/posts/${id}`);
            setPosts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post.");
        }
    }

    function startEditing(post: Post) {
        setEditingPostId(post.id);
        setPostContent(post.content);
        setPostImage(post.image || "");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelEdit() {
        setEditingPostId(null);
        setPostContent("");
        setPostImage("");
    }

    if (loading) {
        return <div className="text-white p-8">Loading...</div>;
    }

    return (
        <div className="max-w-4xl space-y-8 pb-10">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">Manage Docent AI</h1>
                <p className="text-zinc-400">Customize the AI identity and manage its content.</p>
            </div>

            {/* TABS */}
            <div className="flex gap-4 border-b border-zinc-800">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`pb-3 px-1 text-sm font-medium transition-colors ${activeTab === "profile" ? "text-blue-500 border-b-2 border-blue-500" : "text-zinc-400 hover:text-white"}`}
                >
                    Profile Settings
                </button>
                <button
                    onClick={() => setActiveTab("posts")}
                    className={`pb-3 px-1 text-sm font-medium transition-colors ${activeTab === "posts" ? "text-blue-500 border-b-2 border-blue-500" : "text-zinc-400 hover:text-white"}`}
                >
                    Manage Posts
                </button>
            </div>

            {activeTab === "profile" && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                        <div
                            className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden relative cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => avatarInputRef.current?.click()}
                        >
                            {uploadingAvatar ? (
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            ) : formData.photoURL ? (
                                <img src={formData.photoURL} alt="AI Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-10 h-10 text-zinc-500" />
                            )}

                            {!uploadingAvatar && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Profile Picture</h3>
                            <p className="text-xs text-zinc-500 mb-2">This avatar will appear on all AI posts.</p>
                            <input
                                type="file"
                                ref={avatarInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                            />
                            {formData.photoURL && (
                                <button
                                    onClick={() => setFormData(prev => ({ ...prev, photoURL: "" }))}
                                    className="text-xs text-red-400 hover:underline"
                                >
                                    Remove Photo
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Display Name</label>
                            <input
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={3}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Profile
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "posts" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

                    {/* Create/Edit Post */}
                    <div className={`bg-zinc-900 border ${editingPostId ? 'border-purple-500/50' : 'border-zinc-800'} rounded-xl p-6 space-y-4 transition-colors`}>
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                {editingPostId ? (
                                    <>
                                        <Pencil className="w-4 h-4 text-purple-400" />
                                        Editing Post
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                        Create Manual Post
                                    </>
                                )}
                            </h3>
                            {editingPostId && (
                                <button onClick={cancelEdit} className="text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1">
                                    <X className="w-3 h-3" /> Cancel Edit
                                </button>
                            )}
                        </div>

                        <div>
                            <textarea
                                placeholder={`What's on your mind, ${formData.displayName}?`}
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                rows={3}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-all resize-none"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <div
                                    className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 cursor-pointer hover:border-zinc-700 transition-colors"
                                    onClick={() => postImageInputRef.current?.click()}
                                >
                                    {uploadingPostImage ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                                    ) : (
                                        <ImageIcon className="w-4 h-4 text-zinc-500" />
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        ref={postImageInputRef}
                                        onChange={handlePostImageUpload}
                                    />
                                    <span className="text-sm text-zinc-500 truncate">
                                        {postImage ? "Image Attached (Click to change)" : "Upload Image"}
                                    </span>
                                </div>
                                {postImage && (
                                    <div className="mt-2 relative w-16 h-16 rounded overflow-hidden group">
                                        <img src={postImage} className="w-full h-full object-cover" />
                                        <div
                                            className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); setPostImage(""); }}
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleSubmitPost}
                                disabled={publishing || !postContent.trim()}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingPostId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                                {editingPostId ? "Save Changes" : "Post"}
                            </button>
                        </div>
                    </div>

                    {/* Posts List */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <LayoutList className="w-4 h-4 text-zinc-400" />
                            Recent AI Posts
                        </h3>

                        {postsLoading ? (
                            <div className="text-center py-10 text-zinc-500">Loading posts...</div>
                        ) : posts.length === 0 ? (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">
                                No posts found for {formData.displayName}.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {posts.map(post => (
                                    <div key={post.id} className={`bg-zinc-900 border ${editingPostId === post.id ? 'border-purple-500' : 'border-zinc-800'} rounded-lg p-4 flex gap-4 hover:border-zinc-700 transition-colors`}>
                                        {/* Thumbnail */}
                                        <div className="w-20 h-20 bg-zinc-950 rounded-md overflow-hidden flex-shrink-0 border border-zinc-800">
                                            {post.image ? (
                                                <img src={post.image} alt="Post" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="text-xs text-zinc-500 mb-1">
                                                    {new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString()}
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => startEditing(post)}
                                                        className="text-zinc-500 hover:text-blue-400 p-1 rounded transition-colors"
                                                        title="Edit Post"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePost(post.id)}
                                                        className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors"
                                                        title="Delete Post"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-zinc-300 line-clamp-2">{post.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}
