"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/Button";
import { Plus, Users, ArrowRight, LogIn, Settings } from "lucide-react";
import { OptionsModal } from "@/components/OptionsModal";

export default function Home() {
    const router = useRouter();
    const { createGroup, joinGroup, groups, isLoading, error } = useStore();

    useEffect(() => {
        console.log("Divisor Pecuniae v1.0.1 loaded");
    }, []);

    const [groupName, setGroupName] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [mode, setMode] = useState<'create' | 'join' | null>(null);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName.trim()) return;

        const form = e.target as HTMLFormElement;
        const initialMembersInput = form.elements.namedItem("initialMembers") as HTMLInputElement;
        const initialMembers = initialMembersInput.value
            .split(",")
            .map(name => name.trim())
            .filter(name => name.length > 0);

        const groupId = await createGroup(groupName, "EUR");

        if (groupId) {
            // Add initial members
            if (initialMembers.length > 0) {
                for (const name of initialMembers) {
                    await useStore.getState().addUserToGroup(groupId, name);
                }
            }
            router.push(`/group/${groupId}`);
        }
    };

    const handleJoinGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode.trim()) return;

        const groupId = await joinGroup(inviteCode.trim());
        if (groupId) {
            router.push(`/group/${groupId}`);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

            {/* Options Button */}
            <div className="absolute top-6 right-6 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-black/20 backdrop-blur-md border border-white/5 hover:bg-black/40"
                    onClick={() => setIsOptionsOpen(true)}
                >
                    <Settings className="h-5 w-5 text-muted-foreground" />
                </Button>
            </div>

            <OptionsModal isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} />

            <div className="max-w-md w-full space-y-10 text-center relative z-10">
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center p-3 bg-orange-500/10 rounded-2xl mb-4 ring-1 ring-orange-500/20 shadow-[0_0_30px_-10px_rgba(255,100,0,0.3)]">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-inner bg-gradient-to-br from-red-600 to-orange-500 p-[1px]">
                            <div className="w-full h-full rounded-[11px] overflow-hidden">
                                <img src="/mario-coin.jpg" alt="App Icon" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-sm">
                        Divisor <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">pecuniae</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xs mx-auto leading-relaxed text-balance">
                        Pecunia Marii omnia emit, eam sapienter expende et cum amicis tuis communica.
                    </p>
                </div>

                <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                    {!mode ? (
                        <>
                            <Button size="lg" className="w-full text-lg h-16 shadow-xl shadow-orange-500/20 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 border-0" onClick={() => setMode('create')}>
                                <Plus className="mr-2 h-6 w-6" />
                                Create New Group
                            </Button>
                            <Button variant="glass" size="lg" className="w-full text-lg h-16" onClick={() => setMode('join')}>
                                <LogIn className="mr-2 h-6 w-6" />
                                Join with Code
                            </Button>
                        </>
                    ) : mode === 'create' ? (
                        <form onSubmit={handleCreateGroup} className="space-y-6 animate-in fade-in zoom-in-95 duration-300 bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl text-left relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                            <div className="space-y-4 relative">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Group Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Trip to Rome"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        className="flex h-14 w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all shadow-inner"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Initial Members</label>
                                    <input
                                        type="text"
                                        placeholder="Alice, Bob, Charlie"
                                        name="initialMembers"
                                        className="flex h-14 w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all shadow-inner"
                                    />
                                    <p className="text-[10px] text-muted-foreground ml-1 uppercase tracking-wide">Optional • Comma separated</p>
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <div className="flex gap-3 pt-2 relative">
                                <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setMode(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/25" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create'}
                                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleJoinGroup} className="space-y-6 animate-in fade-in zoom-in-95 duration-300 bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl text-left relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                            <div className="space-y-4 relative">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Invite Code</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. abc-123"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value)}
                                        className="flex h-14 w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all shadow-inner"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <div className="flex gap-3 pt-2 relative">
                                <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setMode(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/25" disabled={isLoading}>
                                    {isLoading ? 'Joining...' : 'Join Group'}
                                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>

                {groups.length > 0 && !mode && (
                    <div className="mt-12 pt-8 border-t border-white/5 animate-in fade-in duration-1000 delay-300">
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">Recent Groups</h2>
                        <div className="grid gap-3">
                            {groups.map(group => (
                                <div
                                    key={group.id}
                                    onClick={() => router.push(`/group/${group.id}`)}
                                    className="group relative w-full flex items-center justify-between p-4 rounded-2xl bg-card/30 border border-white/5 hover:bg-card/50 hover:border-primary/30 transition-all cursor-pointer active:scale-[0.98]"
                                >
                                    <span className="font-medium text-lg group-hover:text-primary transition-colors">{group.name}</span>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-orange-500/20 group-hover:text-orange-500 transition-all">
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
