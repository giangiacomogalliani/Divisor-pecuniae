import { create } from 'zustand';
import { Group, User, Expense, Category } from './types';
import { supabase } from './supabase';

const DEFAULT_CATEGORIES: Category[] = [
    { id: "food", label: "Food", icon: "🍔" },
    { id: "transport", label: "Transport", icon: "🚕" },
    { id: "shopping", label: "Shopping", icon: "🛍️" },
    { id: "entertainment", label: "Entertainment", icon: "🎬" },
    { id: "travel", label: "Travel", icon: "✈️" },
    { id: "other", label: "Other", icon: "📝" },
];

interface AppState {
    groups: Group[];
    currentGroupId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    createGroup: (name: string, currency: string) => Promise<string | null>;
    joinGroup: (inviteCode: string) => Promise<string | null>; // Returns groupId
    selectGroup: (groupId: string) => void;
    syncGroup: (groupId: string) => Promise<void>;

    addUserToGroup: (groupId: string, name: string) => Promise<void>;
    addExpense: (groupId: string, expense: Omit<Expense, 'id'>) => Promise<void>;
    updateExpense: (groupId: string, expenseId: string, expenseData: Partial<Omit<Expense, 'id'>>) => Promise<void>;
    deleteExpense: (groupId: string, expenseId: string) => Promise<void>;
    addCategory: (groupId: string, category: Omit<Category, 'id'>) => Promise<void>;
    deleteCategory: (groupId: string, categoryId: string) => Promise<void>;

    // Getters
    getGroup: (groupId: string) => Group | undefined;
}

export const useStore = create<AppState>((set, get) => ({
    groups: [],
    currentGroupId: null,
    isLoading: false,
    error: null,

    createGroup: async (name, currency) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('groups')
                .insert({ name, currency })
                .select()
                .single();

            if (error) throw error;

            const newGroup: Group = {
                id: data.id,
                name: data.name,
                currency: data.currency,
                inviteCode: data.invite_code,
                users: [],
                expenses: [],
                categories: DEFAULT_CATEGORIES,
            };

            set((state) => ({
                groups: [...state.groups, newGroup],
                currentGroupId: newGroup.id,
                isLoading: false,
            }));

            return newGroup.id;
        } catch (err: any) {
            console.error('Error creating group:', err);
            set({ error: err.message, isLoading: false });
            return null;
        }
    },

    joinGroup: async (inviteCode) => {
        set({ isLoading: true, error: null });
        try {
            // Find group by invite code
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select('*')
                .eq('invite_code', inviteCode)
                .single();

            if (groupError) throw new Error('Group not found');

            // We found the group, now let's sync it to get users and expenses
            // But first, add it to our local state if not present
            const existingGroup = get().groups.find(g => g.id === groupData.id);
            if (!existingGroup) {
                const newGroup: Group = {
                    id: groupData.id,
                    name: groupData.name,
                    currency: groupData.currency,
                    inviteCode: groupData.invite_code,
                    users: [],
                    expenses: [],
                    categories: DEFAULT_CATEGORIES,
                };
                set(state => ({ groups: [...state.groups, newGroup] }));
            }

            set({ currentGroupId: groupData.id, isLoading: false });
            return groupData.id;
        } catch (err: any) {
            console.error('Error joining group:', err);
            set({ error: err.message, isLoading: false });
            return null;
        }
    },

    selectGroup: (groupId) => {
        set({ currentGroupId: groupId });
        get().syncGroup(groupId);
    },

    syncGroup: async (groupId) => {
        // Fetch all data for the group
        const { data: groupData, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .eq('id', groupId)
            .single();

        if (groupError) return;

        const { data: usersData } = await supabase
            .from('users')
            .select('*')
            .eq('group_id', groupId);

        const { data: expensesData } = await supabase
            .from('expenses')
            .select('*')
            .eq('group_id', groupId);

        const { data: categoriesData } = await supabase
            .from('categories')
            .select('*')
            .eq('group_id', groupId);

        set((state) => ({
            groups: state.groups.map((g) => {
                if (g.id === groupId) {
                    return {
                        ...g,
                        name: groupData.name,
                        currency: groupData.currency,
                        inviteCode: groupData.invite_code,
                        users: (usersData || []).map(u => ({ id: u.id, name: u.name })),
                        expenses: (expensesData || []).map(e => ({
                            id: e.id,
                            description: e.description,
                            amount: Number(e.amount),
                            paidBy: e.paid_by,
                            splitDetails: e.split_details,
                            category: e.category,
                            date: e.date
                        })),
                        categories: categoriesData && categoriesData.length > 0
                            ? categoriesData.map(c => ({ id: c.id, label: c.label, icon: c.icon }))
                            : DEFAULT_CATEGORIES
                    };
                }
                return g;
            }),
        }));

        // Subscribe to changes
        const channel = supabase
            .channel(`group-${groupId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'users', filter: `group_id=eq.${groupId}` },
                () => { get().syncGroup(groupId); }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'expenses', filter: `group_id=eq.${groupId}` },
                () => { get().syncGroup(groupId); }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'categories', filter: `group_id=eq.${groupId}` },
                () => { get().syncGroup(groupId); }
            )
            .subscribe();

        // Note: In a real app we should unsubscribe when switching groups
    },

    addUserToGroup: async (groupId, name) => {
        try {
            const { error } = await supabase
                .from('users')
                .insert({ group_id: groupId, name });

            if (error) throw error;
            // State update will happen via subscription or we can optimistically update
            get().syncGroup(groupId);
        } catch (err) {
            console.error(err);
        }
    },

    addExpense: async (groupId, expense) => {
        try {
            const { error } = await supabase
                .from('expenses')
                .insert({
                    group_id: groupId,
                    description: expense.description,
                    amount: expense.amount,
                    paid_by: expense.paidBy,
                    split_details: expense.splitDetails,
                    category: expense.category,
                    date: expense.date
                });

            if (error) throw error;
            get().syncGroup(groupId);
        } catch (err) {
            console.error(err);
        }
    },

    updateExpense: async (groupId, expenseId, expenseData) => {
        try {
            const updates: any = {};
            if (expenseData.description) updates.description = expenseData.description;
            if (expenseData.amount) updates.amount = expenseData.amount;
            if (expenseData.paidBy) updates.paid_by = expenseData.paidBy;
            if (expenseData.splitDetails) updates.split_details = expenseData.splitDetails;
            if (expenseData.category) updates.category = expenseData.category;
            if (expenseData.date) updates.date = expenseData.date;

            const { error } = await supabase
                .from('expenses')
                .update(updates)
                .eq('id', expenseId);

            if (error) throw error;
            get().syncGroup(groupId);
        } catch (err) {
            console.error(err);
        }
    },

    deleteExpense: async (groupId, expenseId) => {
        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', expenseId);

            if (error) throw error;
            get().syncGroup(groupId);
        } catch (err) {
            console.error(err);
        }
    },

    addCategory: async (groupId, category) => {
        try {
            const { error } = await supabase
                .from('categories')
                .insert({
                    group_id: groupId,
                    label: category.label,
                    icon: category.icon
                });

            if (error) throw error;
            get().syncGroup(groupId);
        } catch (err) {
            console.error(err);
        }
    },

    deleteCategory: async (groupId, categoryId) => {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', categoryId);

            if (error) throw error;
            get().syncGroup(groupId);
        } catch (err) {
            console.error(err);
        }
    },

    getGroup: (groupId) => {
        return get().groups.find((g) => g.id === groupId);
    },
}));
