import { Expense, User, Transaction } from "./types";

export interface Balance {
    userId: string;
    amount: number; // Positive means they are owed money, negative means they owe money
}

export function calculateBalances(users: User[], expenses: Expense[]): Balance[] {
    const balances: Record<string, number> = {};

    // Initialize balances
    users.forEach(user => {
        balances[user.id] = 0;
    });

    expenses.forEach(expense => {
        // Handle multiple payers
        Object.entries(expense.paidBy).forEach(([payerId, paidAmount]) => {
            balances[payerId] = (balances[payerId] || 0) + paidAmount;
        });

        Object.entries(expense.splitDetails).forEach(([userId, splitAmount]) => {
            balances[userId] = (balances[userId] || 0) - splitAmount;
        });
    });

    return Object.entries(balances).map(([userId, amount]) => ({
        userId,
        amount,
    }));
}

export function getSuggestedPayer(balances: Balance[]): string | null {
    if (balances.length === 0) return null;

    // Find the person with the lowest balance (most negative)
    const sorted = [...balances].sort((a, b) => a.amount - b.amount);

    // If everyone is settled (all 0), or close to 0, return null
    if (Math.abs(sorted[0].amount) < 0.01) return null;

    return sorted[0].userId;
}

export function calculateSettlements(balances: Balance[]): Transaction[] {
    // Basic algorithm to settle debts
    // 1. Separate into debtors (negative) and creditors (positive)
    // 2. Sort both by magnitude
    // 3. Match them up

    // Clone balances to avoid mutating the input array which might be used elsewhere
    const workingBalances = balances.map(b => ({ ...b }));

    let debtors = workingBalances.filter(b => b.amount < -0.01).sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
    let creditors = workingBalances.filter(b => b.amount > 0.01).sort((a, b) => b.amount - a.amount); // Descending (most positive first)

    const transactions: Transaction[] = [];

    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The amount to settle is the minimum of what the debtor owes and what the creditor is owed
        const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        // Only add transaction if amount is significant
        if (amount > 0.005) {
            transactions.push({
                fromUserId: debtor.userId,
                toUserId: creditor.userId,
                amount: Number(amount.toFixed(2))
            });
        }

        debtor.amount += amount;
        creditor.amount -= amount;

        // If settled (close to 0), move to next
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return transactions;
}
