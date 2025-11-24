import { calculateBalances, calculateSettlements, Balance } from './src/lib/logic';
import { User, Expense } from './src/lib/types';

// Mock Data
const users: User[] = [
    { id: 'A', name: 'Alice' },
    { id: 'B', name: 'Bob' },
    { id: 'C', name: 'Charlie' }
];

// Scenario 1: Alice owes Bob 50 and Charlie 50
// Alice paid 0. Bob paid 50. Charlie paid 50.
// Total 100. Split equally 33.33? No, let's make it simple.
// Expense 1: Bob paid 50, split equally A, B (25 each).
// Expense 2: Charlie paid 50, split equally A, C (25 each).
// A owes B 25. A owes C 25.
// Balances:
// A: -25 -25 = -50
// B: +50 -25 = +25
// C: +50 -25 = +25

const expenses: Expense[] = [
    {
        id: '1',
        description: 'Exp 1',
        amount: 50,
        paidBy: { 'B': 50 },
        category: 'food',
        date: '2023-01-01',
        splitDetails: { 'A': 25, 'B': 25 }
    },
    {
        id: '2',
        description: 'Exp 2',
        amount: 50,
        paidBy: { 'C': 50 },
        category: 'food',
        date: '2023-01-01',
        splitDetails: { 'A': 25, 'C': 25 }
    }
];

console.log('--- Test Run ---');
const balances = calculateBalances(users, expenses);
console.log('Balances:', balances);

// Clone balances because calculateSettlements modifies them
const balancesForSettlement = balances.map(b => ({ ...b }));
const settlements = calculateSettlements(balancesForSettlement);

console.log('Settlements:', settlements);

if (settlements.length !== 2) {
    console.error('❌ Expected 2 settlements, got', settlements.length);
} else {
    console.log('✅ Got 2 settlements');
}
