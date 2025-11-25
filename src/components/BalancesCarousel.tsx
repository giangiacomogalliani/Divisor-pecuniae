import { useState, useRef, useEffect } from "react";
import { User, Expense, Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BalancesCarouselProps {
    users: User[];
    expenses: Expense[];
    categories: Category[];
    currency: string;
}

export function BalancesCarousel({ users, expenses, categories, currency }: BalancesCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (scrollRef.current) {
            const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
            setActiveIndex(index);
        }
    };

    const scrollTo = (index: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                left: index * scrollRef.current.clientWidth,
                behavior: 'smooth'
            });
        }
    };

    // --- Data Calculations ---

    // 1. Total Spent per User
    const totalSpentByUser = users.map(user => {
        const total = expenses.reduce((sum, expense) => {
            return sum + (expense.paidBy[user.id] || 0);
        }, 0);
        return { user, total };
    }).sort((a, b) => b.total - a.total);

    const maxSpent = Math.max(...totalSpentByUser.map(i => i.total), 1);

    // 2. Expenses over Time (Daily)
    // Group by date (YYYY-MM-DD)
    const expensesByDate = expenses.reduce((acc, expense) => {
        const date = new Date(expense.date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + expense.amount;
        return acc;
    }, {} as { [date: string]: number });

    // Get last 7 days with activity or just sorted dates? Let's show sorted dates with activity.
    const sortedDates = Object.keys(expensesByDate).sort();
    const chartData = sortedDates.map(date => ({
        date,
        amount: expensesByDate[date]
    }));
    const maxDaily = Math.max(...chartData.map(d => d.amount), 1);

    // 3. Expenses by Category
    const expensesByCategory = categories.map(cat => {
        const total = expenses
            .filter(e => e.category === cat.id)
            .reduce((sum, e) => sum + e.amount, 0);
        return { ...cat, total };
    }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);


    return (
        <div className="space-y-4">
            {/* Carousel Container */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-3xl border border-white/5 bg-black/20 backdrop-blur-sm"
                style={{ scrollbarWidth: 'none' }}
            >
                {/* View 1: Total Spent */}
                <div className="min-w-full snap-center p-6">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 ml-1">Total Share</h3>

                    {/* Total Group Spending */}
                    <div className="mb-6 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Group Total</p>
                        <p className="text-3xl font-bold text-foreground">
                            {expenses
                                .filter(e => e.category !== 'settlement')
                                .reduce((sum, e) => sum + e.amount, 0)
                                .toFixed(2)} {currency}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {users.map(user => {
                            // Calculate user's share (consumption) excluding settlements
                            const userShare = expenses
                                .filter(e => e.category !== 'settlement')
                                .reduce((sum, e) => {
                                    return sum + (e.splitDetails[user.id] || 0);
                                }, 0);

                            const totalGroupSpend = expenses
                                .filter(e => e.category !== 'settlement')
                                .reduce((sum, e) => sum + e.amount, 0);

                            const percentage = totalGroupSpend > 0 ? (userShare / totalGroupSpend) * 100 : 0;

                            return (
                                <div key={user.id} className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>{user.name}</span>
                                        <span className="font-bold">{userShare.toFixed(2)} {currency}</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        }).sort((a, b) => {
                            // Sort by share amount descending
                            const shareA = parseFloat(a.props.children[0].props.children[1].props.children[0]);
                            const shareB = parseFloat(b.props.children[0].props.children[1].props.children[0]);
                            return shareB - shareA;
                        })}
                        {expenses.filter(e => e.category !== 'settlement').length === 0 && (
                            <p className="text-center text-muted-foreground text-sm py-4">No expenses yet.</p>
                        )}
                    </div>
                </div>

                {/* View 2: Time Chart */}
                <div className="min-w-full snap-center p-6 flex flex-col">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 ml-1">Spending Over Time</h3>

                    {/* Chart Container */}
                    <div className="flex-1 flex items-end gap-3 justify-between min-h-[180px] pb-6">
                        {chartData.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
                        ) : (
                            chartData.slice(-7).map((data) => {
                                // Calculate stacked segments
                                const segments = users.map((user, userIndex) => {
                                    const userTotal = expenses
                                        .filter(e => new Date(e.date).toISOString().split('T')[0] === data.date)
                                        .reduce((sum, e) => sum + (e.paidBy[user.id] || 0), 0);

                                    if (userTotal === 0) return null;

                                    // Color palette
                                    const colors = [
                                        "bg-indigo-500", "bg-emerald-500", "bg-amber-500",
                                        "bg-rose-500", "bg-cyan-500", "bg-fuchsia-500"
                                    ];
                                    const color = colors[userIndex % colors.length];

                                    return { user, amount: userTotal, color };
                                }).filter(Boolean) as { user: User, amount: number, color: string }[];

                                return (
                                    <div key={data.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                        <div className="w-full relative flex flex-col-reverse justify-start rounded-t-lg overflow-hidden bg-white/5" style={{ height: `${(data.amount / maxDaily) * 100}%` }}>
                                            {segments.map((segment, i) => (
                                                <div
                                                    key={segment.user.id}
                                                    className={cn(segment.color, "w-full transition-all duration-300 hover:opacity-80 relative group/segment")}
                                                    style={{ height: `${(segment.amount / data.amount) * 100}%` }}
                                                >
                                                    {/* Tooltip for segment */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/segment:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                        {segment.user.name}: {segment.amount.toFixed(0)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                                            {new Date(data.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-3 mt-auto pt-4 border-t border-white/5">
                        {users.map((user, index) => {
                            const colors = [
                                "bg-indigo-500", "bg-emerald-500", "bg-amber-500",
                                "bg-rose-500", "bg-cyan-500", "bg-fuchsia-500"
                            ];
                            const color = colors[index % colors.length];
                            return (
                                <div key={user.id} className="flex items-center gap-1.5">
                                    <div className={cn("w-2 h-2 rounded-full", color)} />
                                    <span className="text-[10px] font-medium text-muted-foreground">{user.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* View 3: Category Chart */}
                <div className="min-w-full snap-center p-6">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 ml-1">By Category</h3>
                    <div className="space-y-4">
                        {expensesByCategory.length === 0 ? (
                            <p className="text-center text-muted-foreground text-sm py-4">No expenses yet.</p>
                        ) : (
                            expensesByCategory.map(cat => (
                                <div key={cat.id} className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                                        {cat.icon}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{cat.label}</span>
                                            <span className="text-muted-foreground">{((cat.total / totalExpenses) * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full"
                                                style={{ width: `${(cat.total / totalExpenses) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold w-16 text-right">{cat.total.toFixed(0)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Indicators */}
            <div className="flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                    <button
                        key={i}
                        onClick={() => scrollTo(i)}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            activeIndex === i ? "w-6 bg-orange-500" : "w-1.5 bg-white/20 hover:bg-white/40"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
