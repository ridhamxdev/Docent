'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Inline SVGs for no-dependency icons
const GoogleIcon = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" version="1.1" x="0px" y="0px" viewBox="0 0 48 48" enableBackground="new 0 0 48 48" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const AppleIcon = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 79.9c5.2 14.7 24 69.4 52 70.2 13 1.2 59.8-23 59.8-23s43 23.4 60.5 23c31.1-.8 53-70.1 53-70.1s-37.1-14.8-37.5-62.7l.5-22.1zM255.9 81c15.7-19.4 34.6-28.5 54.9-28.5 3.3 35.8-28.8 70-56.7 69-14.9 1.2-35.8-9.4-43.2-28.5-.6-12 18.2-26.6 45-12z"></path>
    </svg>
);


export default function AdminLoginPage() {
    const { loginWithGoogle, loginWithApple, user, logout } = useAuth();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (provider: 'google' | 'apple') => {
        setError(null);
        setLoading(true);
        try {
            if (provider === 'google') {
                await loginWithGoogle('admin');
            } else {
                await loginWithApple('admin');
            }
            // AuthContext handles the redirect if successful & role matches
            // But we need to double check here because AuthContext might be lenient
            // We will rely on the AuthContext's logic or add a check here if needed.
            // For now, let's assume AuthContext redirects to /admin or we can force it.
            router.push('/admin');

        } catch (err: any) {
            console.error("Login failed", err);
            setError("Authentication failed. Please try again.");
            setLoading(false);
        }
    };

    // If user is already logged in and is admin, redirect
    useEffect(() => {
        if (user && user.role === 'admin') {
            router.push('/admin');
        }
    }, [user, router]);

    if (user && user.role === 'admin') {
        return null;
    }

    // If user is logged in but NOT admin, show error (handled by AuthContext generally, but good to have UI)
    if (user && user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="bg-zinc-900 p-8 rounded-2xl max-w-md w-full text-center space-y-4 border border-zinc-800">
                    <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                    <p className="text-zinc-400">
                        You are logged in as <span className="text-white font-semibold">{user.role}</span>.
                        This portal is for <span className="text-white font-semibold">Admins</span> only.
                    </p>
                    <button
                        onClick={() => logout()}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg transition-all"
                    >
                        Logout
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-zinc-900 p-8 rounded-2xl max-w-md w-full space-y-8 border border-zinc-800">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Docent Admin</h1>
                    <p className="text-zinc-400">Sign in to manage the platform</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={() => handleLogin('google')}
                        disabled={loading}
                        className="w-full bg-white text-black font-semibold h-12 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="text-xl"><GoogleIcon /></div>
                        <span>Sign in with Google</span>
                    </button>

                    <button
                        onClick={() => handleLogin('apple')}
                        disabled={loading}
                        className="w-full bg-zinc-800 text-white font-semibold h-12 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-700 transition-all active:scale-[0.98] border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="text-xl"><AppleIcon /></div>
                        <span>Sign in with Apple</span>
                    </button>
                </div>

                <div className="pt-4 text-center">
                    <p className="text-xs text-zinc-600">
                        Authorized personnel only. All activities are monitored.
                    </p>
                </div>
            </div>
        </div>
    );
}
