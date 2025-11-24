import { calculateBalances, calculateSettlements, Balance } from './src/lib/logic';
import { User, Expense } from './src/lib/types';

const users: User[] = [
    { id: 'A', name: 'Alice' },
    { id: 'B', name: 'Bob' },
    { id: 'C', name: 'Charlie' },
    { id: 'D', name: 'David' }
];

function runTest(name: string, expenses: Expense[], expectedSettlements: number) {
    console.log(`\n--- Test: ${name} ---`);
    const balances = calculateBalances(users, expenses);
    console.log('Balances:', balances.filter(b => Math.abs(b.amount) > 0.01).map(b => `${b.userId}: ${b.amount.toFixed(2)}`));

    const settlements = calculateSettlements(balances);
    console.log('Settlements:', settlements.map(s => `${s.fromUserId} -> ${s.toUserId}: ${s.amount}`));

    if (settlements.length === expectedSettlements) {
        console.log('✅ Count Match');
    } else {
        console.error(`❌ Expected ${expectedSettlements} settlements, got ${settlements.length}`);
    }
}

// 1. Simple Split: A pays 100 for A, B.
// A: +50, B: -50.
// Settlement: B -> A 50.
runTest('Simple Split', [{
    id: '1', description: 'test', amount: 100, category: 'test', date: '2023',
    paidBy: { 'A': 100 },
    splitDetails: { 'A': 50, 'B': 50 }
}], 1);

// 2. Multiple Payers: A pays 60, B pays 40. Total 100. Split A, B (50 each).
// A: +10 (60-50), B: -10 (40-50).
// Settlement: B -> A 10.
runTest('Multiple Payers', [{
    id: '2', description: 'test', amount: 100, category: 'test', date: '2023',
    paidBy: { 'A': 60, 'B': 40 },
    splitDetails: { 'A': 50, 'B': 50 }
}], 1);

// 3. One Creditor, Two Debtors.
// A pays 90. Split A(30), B(30), C(30).
// A: +60 (90-30). B: -30. C: -30.
// Settlements: B->A 30, C->A 30.
runTest('One Creditor, Two Debtors', [{
    id: '3', description: 'test', amount: 90, category: 'test', date: '2023',
    paidBy: { 'A': 90 },
    splitDetails: { 'A': 30, 'B': 30, 'C': 30 }
}], 2);

// 4. Two Creditors, One Debtor.
// A pays 30, B pays 30. Split C(60).
// A: +30. B: +30. C: -60.
// Settlements: C->A 30, C->B 30.
runTest('Two Creditors, One Debtor', [{
    id: '4', description: 'test', amount: 60, category: 'test', date: '2023',
    paidBy: { 'A': 30, 'B': 30 },
    splitDetails: { 'C': 60 }
}], 2);

// 5. Complex Chain.
// A pays 100 for B. (B owes A 100)
// B pays 50 for C. (C owes B 50)
// Balances: A +100, B -50 (+50 - 100), C -50.
// Settlements: B -> A 50, C -> A 50.
// Wait.
// A: +100.
// B: -50.
// C: -50.
// Correct.
runTest('Complex Chain', [
    {
        id: '5a', description: 'A for B', amount: 100, category: 'test', date: '2023',
        paidBy: { 'A': 100 },
        splitDetails: { 'B': 100 }
    },
    {
        id: '5b', description: 'B for C', amount: 50, category: 'test', date: '2023',
        paidBy: { 'B': 50 },
        splitDetails: { 'C': 50 }
    }
], 2);
