export interface User {
    id: string;
    name: string;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    paidBy: { [userId: string]: number }; // Amount paid by each user
    category: string;
    date: string;
    splitDetails: { [userId: string]: number }; // Amount owed by each user
}

export interface Category {
    id: string;
    label: string;
    icon: string;
}

export interface Group {
    id: string;
    name: string;
    currency: string;
    inviteCode?: string;
    users: User[];
    expenses: Expense[];
    categories: Category[];
}

export interface Transaction {
    fromUserId: string;
    toUserId: string;
    amount: number;
}
