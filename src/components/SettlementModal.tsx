import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { Button } from "@/components/Button";
import { X, ArrowRight } from "lucide-react";

interface SettlementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSettle: (amount: number) => void;
    debtor: User;
    creditor: User;
    amount: number;
    currency: string;
}

export function SettlementModal({ isOpen, onClose, onSettle, debtor, creditor, amount, currency }: SettlementModalProps) {
    const [settleAmount, setSettleAmount] = useState(amount.toString());

    useEffect(() => {
        setSettleAmount(amount.toString());
    }, [amount, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(settleAmount);
        if (isNaN(val) || val <= 0) return;
        onSettle(val);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md glass-card rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl ring-1 ring-white/10">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-lg font-bold uppercase tracking-widest text-orange-500">Settle Up</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-2xl font-bold border border-white/10">
                                {debtor.name.charAt(0)}
                            </div>
                            <span className="font-bold text-sm">{debtor.name}</span>
                        </div>

                        <div className="flex flex-col items-center text-muted-foreground">
                            <span className="text-[10px] font-bold uppercase tracking-widest mb-1">Paying</span>
                            <ArrowRight className="h-6 w-6 text-orange-500 animate-pulse" />
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-orange-500/20">
                                {creditor.name.charAt(0)}
                            </div>
                            <span className="font-bold text-sm">{creditor.name}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative flex flex-col items-center justify-center py-4">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Amount to Pay</label>
                            <div className="relative flex items-baseline justify-center w-full">
                                <span className="text-3xl font-light text-muted-foreground absolute left-8 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">{currency}</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={settleAmount}
                                    onChange={(e) => setSettleAmount(e.target.value)}
                                    className="w-full bg-transparent text-center text-5xl font-bold text-foreground placeholder:text-muted-foreground/20 focus:outline-none p-2"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>
                            <div className="h-1 w-24 bg-orange-500/30 rounded-full mt-2" />
                        </div>

                        <p className="text-center text-xs text-muted-foreground">
                            Total debt: <span className="font-bold text-foreground">{amount.toFixed(2)} {currency}</span>
                        </p>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <Button type="button" variant="ghost" className="flex-1 h-12 rounded-2xl" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-[2] h-12 rounded-2xl text-lg shadow-lg shadow-orange-500/20 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 border-0">
                            Pay Now
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
