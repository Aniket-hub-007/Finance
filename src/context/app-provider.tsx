
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Transaction, Balances, SavingsGoal, Debt, Lending, Budget } from '@/lib/types';

interface AppContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | '_id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (transaction: Transaction) => Promise<void>;
  balances: Balances;
  setBalances: (balances: Balances) => void;
  
  savingsGoals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | '_id'>) => Promise<void>;
  updateGoal: (goal: SavingsGoal) => Promise<void>;
  deleteGoal: (goal: SavingsGoal) => Promise<void>;

  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id' | '_id'>) => Promise<void>;
  updateDebt: (debt: Debt) => Promise<void>;
  deleteDebt: (debt: Debt) => Promise<void>;

  lending: Lending[];
  addLending: (lending: Omit<Lending, 'id' | '_id'>) => Promise<void>;
  updateLending: (lending: Lending) => Promise<void>;
  deleteLending: (lending: Lending) => Promise<void>;

  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | '_id'>) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (budget: Budget) => Promise<void>;

  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const baseBalances: Balances = {
  bank: 12050.75,
  upi: 2500.50,
  cash: 850.00,
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<Balances>(baseBalances);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [lending, setLending] = useState<Lending[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [transactionsRes, goalsRes, debtsRes, lendingRes, budgetsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/goals'),
        fetch('/api/debts'),
        fetch('/api/lending'),
        fetch('/api/budgets'),
      ]);

      const transactionsData = await transactionsRes.json();
      if (transactionsData.success) {
        const fetchedTransactions = transactionsData.data.map((tx: any) => ({ ...tx, id: tx._id }));
        setTransactions(fetchedTransactions);
        recalculateBalances(fetchedTransactions);
      }

      const goalsData = await goalsRes.json();
      if (goalsData.success) setSavingsGoals(goalsData.data.map((g: any) => ({...g, id: g._id })));

      const debtsData = await debtsRes.json();
      if (debtsData.success) setDebts(debtsData.data.map((d: any) => ({...d, id: d._id })));
      
      const lendingData = await lendingRes.json();
      if (lendingData.success) setLending(lendingData.data.map((l: any) => ({...l, id: l._id })));

      const budgetsData = await budgetsRes.json();
      if (budgetsData.success) setBudgets(budgetsData.data.map((b: any) => ({...b, id: b._id })));

    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const recalculateBalances = (allTransactions: Transaction[]) => {
    const adjustments = allTransactions.reduce((acc, t) => {
        const amount = t.type === 'income' ? t.amount : -Math.abs(t.amount);
        switch (t.paymentMethod) {
            case 'card':
            case 'other':
                acc.bank += amount;
                break;
            case 'upi':
                acc.upi += amount;
                break;
            case 'cash':
                acc.cash += amount;
                break;
        }
        return acc;
    }, { bank: 0, upi: 0, cash: 0 });

    setBalances({
        bank: baseBalances.bank + adjustments.bank,
        upi: baseBalances.upi + adjustments.upi,
        cash: baseBalances.cash + adjustments.cash,
    });
  };

  // Generic API handlers
  const handleApiCall = async <T, U>(endpoint: string, method: 'POST' | 'PUT' | 'DELETE', body: T, idField?: string): Promise<U | null> => {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (result.success) {
        return idField ? { ...result.data, id: result.data[idField] } : result.data;
      } else {
        console.error(`Failed to ${method} ${endpoint}:`, result.error);
        return null;
      }
    } catch (error) {
      console.error(`Error in ${method} ${endpoint}:`, error);
      return null;
    }
  }

  // Transactions
  const addTransaction = async (transaction: Omit<Transaction, 'id' | '_id'>) => {
    const newTransaction = await handleApiCall<Omit<Transaction, 'id' | '_id'>, Transaction>('/api/transactions', 'POST', transaction, '_id');
    if (newTransaction) {
      setTransactions(prev => {
        const newTransactions = [newTransaction, ...prev];
        recalculateBalances(newTransactions);
        return newTransactions;
      });
    }
  };
  const updateTransaction = async (updatedTransaction: Transaction) => {
    const result = await handleApiCall<Transaction, Transaction>('/api/transactions', 'PUT', updatedTransaction, '_id');
    if (result) {
      setTransactions(prev => {
        const newTransactions = prev.map(t => (t.id === result.id ? result : t));
        recalculateBalances(newTransactions);
        return newTransactions;
      });
    }
  };
  const deleteTransaction = async (transactionToDelete: Transaction) => {
    const result = await handleApiCall<{ id: string }, any>('/api/transactions', 'DELETE', { id: transactionToDelete.id });
    if (result) {
      setTransactions(prev => {
        const newTransactions = prev.filter(t => t.id !== transactionToDelete.id);
        recalculateBalances(newTransactions);
        return newTransactions;
      });
    }
  };

  // Goals
  const addGoal = async (goal: Omit<SavingsGoal, 'id' | '_id'>) => {
    const newGoal = await handleApiCall<Omit<SavingsGoal, 'id' | '_id'>, SavingsGoal>('/api/goals', 'POST', goal, '_id');
    if (newGoal) setSavingsGoals(prev => [newGoal, ...prev]);
  };
  const updateGoal = async (updatedGoal: SavingsGoal) => {
    const result = await handleApiCall<SavingsGoal, SavingsGoal>('/api/goals', 'PUT', updatedGoal, '_id');
    if (result) setSavingsGoals(prev => prev.map(g => (g.id === result.id ? result : g)));
  };
  const deleteGoal = async (goalToDelete: SavingsGoal) => {
    const result = await handleApiCall<{ id: string }, any>('/api/goals', 'DELETE', { id: goalToDelete.id });
    if (result) setSavingsGoals(prev => prev.filter(g => g.id !== goalToDelete.id));
  };
  
  // Debts
  const addDebt = async (debt: Omit<Debt, 'id' | '_id'>) => {
    const newDebt = await handleApiCall<Omit<Debt, 'id' | '_id'>, Debt>('/api/debts', 'POST', debt, '_id');
    if (newDebt) setDebts(prev => [newDebt, ...prev]);
  };
  const updateDebt = async (updatedDebt: Debt) => {
    const result = await handleApiCall<Debt, Debt>('/api/debts', 'PUT', updatedDebt, '_id');
    if (result) setDebts(prev => prev.map(d => (d.id === result.id ? result : d)));
  };
  const deleteDebt = async (debtToDelete: Debt) => {
    const result = await handleApiCall<{ id: string }, any>('/api/debts', 'DELETE', { id: debtToDelete.id });
    if (result) setDebts(prev => prev.filter(d => d.id !== debtToDelete.id));
  };

  // Lending
  const addLending = async (lendingItem: Omit<Lending, 'id' | '_id'>) => {
    const newLending = await handleApiCall<Omit<Lending, 'id' | '_id'>, Lending>('/api/lending', 'POST', lendingItem, '_id');
    if (newLending) setLending(prev => [newLending, ...prev]);
  };
  const updateLending = async (updatedLending: Lending) => {
    const result = await handleApiCall<Lending, Lending>('/api/lending', 'PUT', updatedLending, '_id');
    if (result) setLending(prev => prev.map(l => (l.id === result.id ? result : l)));
  };
  const deleteLending = async (lendingToDelete: Lending) => {
    const result = await handleApiCall<{ id: string }, any>('/api/lending', 'DELETE', { id: lendingToDelete.id });
    if (result) setLending(prev => prev.filter(l => l.id !== lendingToDelete.id));
  };

  // Budgets
  const addBudget = async (budget: Omit<Budget, 'id' | '_id'>) => {
    const newBudget = await handleApiCall<Omit<Budget, 'id' | '_id'>, Budget>('/api/budgets', 'POST', budget, '_id');
    if (newBudget) setBudgets(prev => [newBudget, ...prev]);
  };
  const updateBudget = async (updatedBudget: Budget) => {
    const result = await handleApiCall<Budget, Budget>('/api/budgets', 'PUT', updatedBudget, '_id');
    if (result) setBudgets(prev => prev.map(b => (b.id === result.id ? result : b)));
  };
  const deleteBudget = async (budgetToDelete: Budget) => {
    const result = await handleApiCall<{ id: string }, any>('/api/budgets', 'DELETE', { id: budgetToDelete.id });
    if (result) setBudgets(prev => prev.filter(b => b.id !== budgetToDelete.id));
  };


  const value = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    balances,
    setBalances,
    savingsGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    debts,
    addDebt,
    updateDebt,
    deleteDebt,
    lending,
    addLending,
    updateLending,
    deleteLending,
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    isLoading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
