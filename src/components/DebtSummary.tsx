import { User, Transaction, Expense, Category } from "@/lib/types";
import { Balance } from "@/lib/logic";
import { cn } from "@/lib/utils";
import { BalancesCarousel } from "./BalancesCarousel";

interface DebtSummaryProps {
    users: User[];
    balances: Balance[];
    expenses: Expense[];
    categories: Category[];
    settlements: Transaction[];
    suggestedPayerId: string | null;
    currency: string;
    onSettle?: (fromUserId: string, toUserId: string, amount: number) => void;
}

export function DebtSummary({ users, balances, expenses, categories, settlements, suggestedPayerId, currency, onSettle }: DebtSummaryProps) {
    const getUserName = (id: string) => users.find(u => u.id === id)?.name || "Unknown";
    const suggestedPayer = suggestedPayerId ? users.find(u => u.id === suggestedPayerId) : null;

    return (
        <div className="space-y-6">
            {/* Suggested Payer Card */}
            {suggestedPayer && (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 p-6 shadow-[0_0_30px_-10px_rgba(255,100,0,0.3)] animate-in fade-in slide-in-from-bottom-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -z-10 pointer-events-none" />

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-orange-500/30">
                                {suggestedPayer.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-background text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-500/30 text-orange-500 uppercase tracking-wider shadow-sm">
                                Next
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Suggested Payer</p>
                            <h3 className="text-2xl font-bold text-foreground">{suggestedPayer.name}</h3>
                            <p className="text-sm text-muted-foreground">Should pay next to balance out.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Balances Carousel */}
            <BalancesCarousel
                users={users}
                expenses={expenses}
                categories={categories}
                currency={currency}
            />

            {/* Settlement Plan */}
            {settlements.length > 0 && (
                <div className="glass-card rounded-3xl p-6 border border-white/5">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 ml-1">Settlement Plan</h3>
                    <div className="space-y-3">
                        {settlements.map((settlement, index) => {
                            const fromUser = users.find(u => u.id === settlement.fromUserId);
                            const toUser = users.find(u => u.id === settlement.toUserId);

                            const fromName = fromUser ? fromUser.name : "Unknown";
                            const toName = toUser ? toUser.name : "Unknown";

                            return (
                                <div key={index} className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="font-bold text-foreground">{fromName}</span>
                                        <div className="flex-1 flex flex-col items-center px-2">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Owes</span>
                                            <div className="w-full h-0.5 bg-white/10 relative">
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/20 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-foreground">{toName}</span>
                                            <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">{settlement.amount.toFixed(2)} {currency}</div>
                                        </div>
                                    </div>

                                    {onSettle && (
                                        <button
                                            onClick={() => onSettle(settlement.fromUserId, settlement.toUserId, settlement.amount)}
                                            className="ml-2 px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider hover:bg-orange-500 hover:text-white transition-all border border-orange-500/20"
                                        >
                                            Settle
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
