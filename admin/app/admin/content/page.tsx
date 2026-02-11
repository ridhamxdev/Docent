"use client";

import { useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";


export default function ContentPage() {
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

    async function handleGenerate() {
        setGenerating(true);
        setResult(null);

        try {
            const res = await fetch("/api/admin/generate-daily-posts", {
                method: "POST",
            });
            const data = await res.json();

            if (res.ok) {
                setResult({ success: true, message: "Successfully generated 3 daily posts!" });
            } else {
                setResult({ success: false, message: data.error || "Failed to generate posts." });
            }
        } catch (err) {
            setResult({ success: false, message: "Network error occurred." });
        } finally {
            setGenerating(false);
        }
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">AI Content Manager</h1>
                    <p className="text-zinc-400">Manage automated daily Circulations (Posts).</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Post Generation Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Daily AI Generation</h3>
                            <p className="text-xs text-zinc-500">Powered by OpenAI GPT-4</p>
                        </div>
                    </div>

                    <div className="text-sm text-zinc-300">
                        This will generate 3 distinct posts for today's circulation:
                        <ul className="list-disc list-inside mt-2 text-zinc-400 space-y-1">
                            <li>Morning: Clinical Case / Knowledge</li>
                            <li>Afternoon: Industry News / Updates</li>
                            <li>Evening: Tip / Quiz / Engagement</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" /> Generate Today's Posts
                            </>
                        )}
                    </button>

                    {result && (
                        <div className={`p-4 rounded-lg text-sm ${result.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                            {result.message}
                        </div>
                    )}
                </div>

                {/* Configuration Placeholder */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 opacity-50 pointer-events-none">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <SettingsIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Prompt Configuration</h3>
                            <p className="text-xs text-zinc-500">Customize AI Personality</p>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-300">
                        Customize the system prompts used for generating content.
                        (Coming Soon)
                    </p>
                </div>
            </div>
        </div>
    );
}

function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
