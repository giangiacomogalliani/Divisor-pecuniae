import { useState, useEffect } from "react";
import { User, Expense, Category } from "@/lib/types";
import { Button } from "@/components/Button";
import { Check, X, Calendar, Clock, Tag, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryManager } from "./CategoryManager";

interface ExpenseFormProps {
    users: User[];
    categories: Category[];
    currency: string;
    onSubmit: (data: { description: string; amount: number; paidBy: { [key: string]: number }; category: string; date: string; splitDetails: { [key: string]: number } }) => void;
    onCancel: () => void;
    onAddCategory: (category: Omit<Category, 'id'>) => void;
    onDeleteCategory: (categoryId: string) => void;
    initialData?: Expense;
}

export function ExpenseForm({ users, categories, currency, onSubmit, onCancel, onAddCategory, onDeleteCategory, initialData }: ExpenseFormProps) {
    const [description, setDescription] = useState(initialData?.description || "");
    const [amount, setAmount] = useState(initialData?.amount.toString() || "");

    // Multiple payers state
    const [paidBy, setPaidBy] = useState<{ [key: string]: number }>(
        initialData?.paidBy || { [users[0]?.id]: initialData?.amount || 0 }
    );

    const [category, setCategory] = useState(initialData?.category || "other");
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(initialData?.date ? new Date(initialData.date).toTimeString().slice(0, 5) : new Date().toTimeString().slice(0, 5));

    const [splitType, setSplitType] = useState<"equal" | "exact">("equal");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
        initialData ? Object.keys(initialData.splitDetails) : users.map(u => u.id)
    );

    // Handle main amount change
    const handleAmountChange = (val: string) => {
        setAmount(val);
        const numVal = parseFloat(val) || 0;

        // If only one payer, update their amount
        const payerIds = Object.keys(paidBy);
        if (payerIds.length === 1) {
            setPaidBy({ [payerIds[0]]: numVal });
        } else if (payerIds.length > 1) {
            // Split equally among payers for now, or keep ratios? 
            // Requirement: "Se si inserisce una cifra nel campo principale, i due utenti dividono a metà"
            const splitAmount = numVal / payerIds.length;
            const newPaidBy: { [key: string]: number } = {};
            payerIds.forEach(id => newPaidBy[id] = parseFloat(splitAmount.toFixed(2)));
            // Adjust last to match exact total if needed? 
            // For simplicity, let's just set equal.
            setPaidBy(newPaidBy);
        }
    };

    // Handle individual payer amount change
    const handlePayerAmountChange = (userId: string, val: string) => {
        const numVal = parseFloat(val) || 0;
        const newPaidBy = { ...paidBy, [userId]: numVal };
        setPaidBy(newPaidBy);

        // Update total amount
        const total = Object.values(newPaidBy).reduce((sum, curr) => sum + curr, 0);
        setAmount(total.toString());
    };

    const togglePayer = (userId: string) => {
        const currentPayers = Object.keys(paidBy);

        if (currentPayers.includes(userId)) {
            if (currentPayers.length === 1) return; // Cannot deselect last payer
            const newPaidBy = { ...paidBy };
            delete newPaidBy[userId];
            setPaidBy(newPaidBy);

            // Recalculate amounts for remaining payers based on current total
            const numAmount = parseFloat(amount) || 0;
            const remainingIds = Object.keys(newPaidBy); // excluding the deleted one
            const splitAmount = numAmount / remainingIds.length;
            remainingIds.forEach(id => newPaidBy[id] = parseFloat(splitAmount.toFixed(2)));
            setPaidBy(newPaidBy);
        } else {
            const newPaidBy = { ...paidBy, [userId]: 0 };
            // Recalculate for all including new one
            const numAmount = parseFloat(amount) || 0;
            const newIds = [...currentPayers, userId];
            const splitAmount = numAmount / newIds.length;
            newIds.forEach(id => newPaidBy[id] = parseFloat(splitAmount.toFixed(2)));
            setPaidBy(newPaidBy);
        }
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds(prev => {
            if (prev.includes(userId)) {
                if (prev.length === 1) return prev;
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (!description || isNaN(numAmount) || numAmount <= 0) return;

        let splitDetails: { [key: string]: number } = {};

        if (splitType === "equal") {
            const splitAmount = numAmount / selectedUserIds.length;
            selectedUserIds.forEach(id => {
                splitDetails[id] = splitAmount;
            });
        }

        // Combine date and time
        const dateTime = new Date(`${date}T${time}`).toISOString();

        onSubmit({
            description,
            amount: numAmount,
            paidBy,
            category,
            date: dateTime,
            splitDetails,
        });
    };

    const payers = Object.keys(paidBy);

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-8 glass-card p-8 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

                <div className="space-y-6">
                    {/* Amount Input - Hero Style */}
                    <div className="relative flex flex-col items-center justify-center py-4">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Amount</label>
                        <div className="relative flex items-baseline justify-center w-full">
                            <span className="text-4xl font-light text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">{currency}</span>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => handleAmountChange(e.target.value)}
                                className="w-full bg-transparent text-center text-6xl font-bold text-foreground placeholder:text-muted-foreground/20 focus:outline-none p-2"
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                        <div className="h-1 w-24 bg-primary/30 rounded-full mt-2" />

                        {/* Individual Payer Inputs (if > 1 payer) */}
                        {payers.length > 1 && (
                            <div className="flex gap-4 mt-4 flex-wrap justify-center animate-in slide-in-from-top-2">
                                {payers.map(payerId => {
                                    const user = users.find(u => u.id === payerId);
                                    return (
                                        <div key={payerId} className="flex flex-col items-center">
                                            <span className="text-[10px] text-muted-foreground mb-1">{user?.name}</span>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={paidBy[payerId] || ""}
                                                    onChange={(e) => handlePayerAmountChange(payerId, e.target.value)}
                                                    className="w-20 bg-white/5 border border-white/10 rounded-lg text-center text-sm py-1 focus:border-primary focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">For what?</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="flex h-14 w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all shadow-inner"
                            placeholder="e.g. Dinner, Taxi, Groceries"
                        />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Category</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all whitespace-nowrap",
                                        category === cat.id
                                            ? "bg-primary/20 border-primary text-primary"
                                            : "bg-white/5 border-white/10 hover:bg-white/10 text-muted-foreground"
                                    )}
                                >
                                    <span>{cat.icon}</span>
                                    <span className="text-xs font-medium">{cat.label}</span>
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setIsCategoryManagerOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="text-xs font-medium">New</span>
                            </button>
                        </div>
                    </div>



                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payer Selection */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Who paid?</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                            {users.map(u => {
                                const isSelected = payers.includes(u.id);
                                return (
                                    <button
                                        key={u.id}
                                        type="button"
                                        onClick={() => togglePayer(u.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap",
                                            isSelected
                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105"
                                                : "bg-white/5 border-white/10 hover:bg-white/10 text-muted-foreground"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                            isSelected ? "bg-white/20" : "bg-white/10"
                                        )}>
                                            {u.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium">{u.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Split Selection */}
                    <div className="space-y-3 pt-2 border-t border-white/5">
                        <div className="flex justify-between items-center">
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Split Among</label>
                            <button
                                type="button"
                                onClick={() => setSelectedUserIds(users.map(u => u.id))}
                                className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
                            >
                                Select All
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {users.map(user => {
                                const isSelected = selectedUserIds.includes(user.id);
                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => toggleUserSelection(user.id)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all duration-200",
                                            isSelected
                                                ? "bg-primary/10 border-primary/50 shadow-[0_0_15px_-5px_rgba(99,102,241,0.2)]"
                                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-6 w-6 rounded-lg flex items-center justify-center border transition-all",
                                            isSelected ? "bg-primary border-primary text-primary-foreground scale-110" : "border-white/20 bg-transparent"
                                        )}>
                                            {isSelected && <Check className="h-4 w-4" />}
                                        </div>
                                        <span className={cn("text-sm font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>{user.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" className="flex-[2] h-14 rounded-2xl text-lg shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-indigo-500 border border-white/20">
                        {initialData ? "Save Changes" : "Add Expense"}
                    </Button>
                </div>
            </form >
            {isCategoryManagerOpen && (
                <CategoryManager
                    categories={categories}
                    onAdd={onAddCategory}
                    onDelete={onDeleteCategory}
                    onClose={() => setIsCategoryManagerOpen(false)}
                />
            )}
        </>
    );
}
