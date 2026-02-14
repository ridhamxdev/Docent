"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    FileCheck,
    Newspaper,
    LogOut,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/auth");
            } else if (user.role !== "admin") {
                router.push("/auth"); // Redirect unauthorized users to access denied screen
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    // Double check to prevent flash of content
    if (!user || user.role !== "admin") {
        return null;
    }

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Verifications", href: "/admin/verifications", icon: FileCheck },
        { name: "Feed Management", href: "/admin/feed-management", icon: Newspaper },
        { name: "AI Content", href: "/admin/content", icon: Newspaper },
        { name: "Docent AI", href: "/admin/docent-ai", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-black text-white">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-zinc-900 border-r border-zinc-800 transition-all duration-300 flex flex-col",
                    isSidebarOpen ? "w-64" : "w-16"
                )}
            >
                <div className="h-16 flex items-center px-6 border-b border-zinc-800">
                    <Link href="/admin" className="flex items-center gap-2 font-bold text-xl">
                        {isSidebarOpen ? <span>Docent Admin</span> : <span>D</span>}
                    </Link>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors",
                                // Add active state logic here if needed, simple for now
                            )}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {isSidebarOpen && <span>{item.name}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-3 border-t border-zinc-800">
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-black p-8">
                {children}
            </main>
        </div>
    );
}
