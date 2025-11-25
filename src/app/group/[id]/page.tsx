"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { calculateBalances, getSuggestedPayer, calculateSettlements } from "@/lib/logic";
import { DebtSummary } from "@/components/DebtSummary";
import { ExpenseForm } from "@/components/ExpenseForm";
import { Button } from "@/components/Button";
import { Plus, ArrowLeft, Receipt, Users, X, Pencil, Trash2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Expense, User } from "@/lib/types";
import { SettlementModal } from "@/components/SettlementModal";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function GroupPage() {
    const params = useParams();
    const router = useRouter();
    const { getGroup, addExpense, updateExpense, deleteExpense, addCategory, deleteCategory, syncGroup, isLoading } = useStore();
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const groupId = params.id as string;
    const group = getGroup(groupId);

    useEffect(() => {
        if (groupId) {
            syncGroup(groupId);
        }
    }, [groupId, syncGroup]);

    // Modal States
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [settlementData, setSettlementData] = useState<{ debtor: User, creditor: User, amount: number } | null>(null);

    if (!group) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Loading group...</p>
                </div>
            </div>
        );
    }

    const balances = calculateBalances(group.users, group.expenses);
    const suggestedPayerId = getSuggestedPayer(balances);
    const settlements = calculateSettlements(balances);

    const handleSaveExpense = async (data: any) => {
        if (editingExpense) {
            await updateExpense(groupId, editingExpense.id, {
                description: data.description,
                amount: data.amount,
                paidBy: data.paidBy,
                category: data.category,
                date: data.date,
                splitDetails: data.splitDetails
            });
            setEditingExpense(null);
        } else {
            await addExpense(groupId, {
                description: data.description,
                amount: data.amount,
                paidBy: data.paidBy,
                category: data.category,
                date: data.date,
                splitDetails: data.splitDetails
            });
        }
        setIsAddingExpense(false);
    };

    const handleDeleteExpense = async () => {
        if (deleteId) {
            await deleteExpense(groupId, deleteId);
            setDeleteId(null);
        }
    };

    const handleSettle = async (amount: number) => {
        if (!settlementData) return;

        await addExpense(groupId, {
            description: "Settlement",
            amount: amount,
            paidBy: { [settlementData.debtor.id]: amount },
            category: "settlement",
            date: new Date().toISOString(),
            splitDetails: {
                [settlementData.creditor.id]: amount
            }
        });

        setSettlementData(null);
    };

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [newMemberName, setNewMemberName] = useState("");

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberName.trim()) return;
        await useStore.getState().addUserToGroup(groupId, newMemberName.trim());
        setNewMemberName("");
    };

    const copyInviteCode = () => {
        if (group.inviteCode) {
            navigator.clipboard.writeText(group.inviteCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <main className="flex-1 pb-24 relative min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-20 glass shadow-lg shadow-black/20">
                <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="rounded-full hover:bg-white/10">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-lg font-bold truncate max-w-[200px] tracking-wide">{group.name}</h1>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest bg-secondary/10 px-2 py-0.5 rounded-full text-secondary">
                            {group.users.length} Members
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="rounded-full hover:bg-white/10">
                        <Users className="h-6 w-6" />
                    </Button>
                </div>
            </header>

            {/* Modals */}
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDeleteExpense}
                title="Delete Expense"
                message="Are you sure you want to delete this expense? This action cannot be undone."
                variant="destructive"
                confirmText="Delete"
            />

            {settlementData && (
                <SettlementModal
                    isOpen={!!settlementData}
                    onClose={() => setSettlementData(null)}
                    onSettle={handleSettle}
                    debtor={settlementData.debtor}
                    creditor={settlementData.creditor}
                    amount={settlementData.amount}
                    currency={group.currency}
                />
            )}

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md glass-card rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl ring-1 ring-white/10">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h2 className="text-lg font-bold uppercase tracking-widest text-primary">Group Settings</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(false)} className="rounded-full hover:bg-white/10">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Invite Code Section */}
                            <div className="space-y-2 bg-primary/10 p-4 rounded-2xl border border-primary/20">
                                <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Invite Code</h3>
                                <p className="text-xs text-muted-foreground mb-2">Share this code with friends to join.</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-black/20 p-3 rounded-xl text-center font-mono text-lg tracking-wider border border-white/10 select-all">
                                        {group.inviteCode || "No Code"}
                                    </code>
                                    <Button size="icon" onClick={copyInviteCode} className="h-12 w-12 rounded-xl shrink-0">
                                        {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Current Members</h3>
                                <div className="grid gap-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                    {group.users.map(user => (
                                        <div key={user.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/20">
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-lg">{user.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleAddMember} className="space-y-4 pt-6 border-t border-white/5">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Add New Member</h3>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                        placeholder="Enter name"
                                        className="flex-1 h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                                    />
                                    <Button type="submit" size="icon" className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                                        <Plus className="h-6 w-6" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 space-y-8 md:grid md:grid-cols-2 md:gap-8 md:space-y-0 md:items-start max-w-5xl mx-auto pt-6">

                {/* Left Column: Actions & Overview */}
                <div className="space-y-8">
                    {/* Actions */}
                    {!isAddingExpense && !editingExpense && (
                        <div className="flex justify-center py-2">
                            <Button size="lg" className="rounded-full h-16 px-8 text-lg shadow-[0_0_40px_-10px_rgba(255,100,0,0.5)] hover:shadow-[0_0_50px_-10px_rgba(255,100,0,0.7)] hover:scale-105 transition-all duration-300 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 border border-white/20" onClick={() => setIsAddingExpense(true)}>
                                <Plus className="mr-2 h-6 w-6" />
                                Add New Expense
                            </Button>
                        </div>
                    )}

                    {/* Add/Edit Expense Form */}
                    {(isAddingExpense || editingExpense) && (
                        <ExpenseForm
                            users={group.users}
                            categories={group.categories}
                            currency={group.currency}
                            onSubmit={handleSaveExpense}
                            onCancel={() => {
                                setIsAddingExpense(false);
                                setEditingExpense(null);
                            }}
                            onAddCategory={(cat) => addCategory(groupId, cat)}
                            onDeleteCategory={(catId) => deleteCategory(groupId, catId)}
                            initialData={editingExpense || undefined}
                        />
                    )}

                    {/* Debt Summary */}
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Overview</h2>
                        </div>
                        <DebtSummary
                            users={group.users}
                            balances={balances}
                            expenses={group.expenses}
                            categories={group.categories}
                            settlements={settlements}
                            suggestedPayerId={suggestedPayerId}
                            currency={group.currency}
                            onSettle={(fromId, toId, amount) => {
                                const debtor = group.users.find(u => u.id === fromId);
                                const creditor = group.users.find(u => u.id === toId);
                                if (debtor && creditor) {
                                    setSettlementData({ debtor, creditor, amount });
                                }
                            }}
                        />
                    </section>
                </div>

                {/* Right Column: Expenses List */}
                <section className="md:h-[calc(100vh-120px)] md:overflow-y-auto md:pr-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="flex items-center justify-between mb-4 px-1 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recent Activity</h2>
                    </div>
                    <div className="space-y-3 pb-20">
                        {group.expenses.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground bg-card/30 rounded-3xl border border-white/5 border-dashed">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Receipt className="h-8 w-8 opacity-40" />
                                </div>
                                <p className="text-lg font-medium">No expenses yet</p>
                                <p className="text-sm opacity-60">Add one to get started!</p>
                            </div>
                        ) : (
                            [...group.expenses].reverse().map((expense, index) => {
                                const payerIds = Object.keys(expense.paidBy);
                                const payerNames = payerIds.map(id => group.users.find(u => u.id === id)?.name).filter(Boolean);
                                const payerDisplay = payerNames.length > 1
                                    ? `${payerNames[0]} + ${payerNames.length - 1} others`
                                    : payerNames[0];

                                return (
                                    <div
                                        key={expense.id}
                                        className="group bg-card/40 hover:bg-card/60 backdrop-blur-sm p-5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all duration-300 flex justify-between items-center shadow-sm hover:shadow-md relative overflow-hidden"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                                {group.categories.find(c => c.id === expense.category)?.icon || "📝"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{expense.description}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    <span className="font-bold text-foreground">{payerDisplay}</span> paid
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-xl tracking-tight">{expense.amount.toFixed(2)} <span className="text-sm font-medium text-muted-foreground">{group.currency}</span></p>
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1 bg-white/5 px-2 py-0.5 rounded-full inline-block">
                                                    {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>

                                            {/* Edit/Delete Actions - Visible on Hover/Focus */}
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-4 bg-card/90 p-1 rounded-xl shadow-lg backdrop-blur-md border border-white/10">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg hover:bg-primary/20 hover:text-primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingExpense(expense);
                                                        setIsAddingExpense(false);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg hover:bg-destructive/20 hover:text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteId(expense.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
