
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Transaction, Balances, SavingsGoal, Debt, Lending, Budget } from '@/lib/types';

interface AppContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | '_id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (transaction: Transaction) => Promise<void>;
  balances: Balances;
  updateBalances: (balances: Balances) => Promise<void>;
  
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

const initialBalances: Balances = {
  bank: 0,
  upi: 0,
  cash: 0,
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<Balances>(initialBalances);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [lending, setLending] = useState<Lending[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [transactionsRes, goalsRes, debtsRes, lendingRes, budgetsRes, balancesRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/goals'),
        fetch('/api/debts'),
        fetch('/api/lending'),
        fetch('/api/budgets'),
        fetch('/api/balances'),
      ]);

      const transactionsData = await transactionsRes.json();
      if (transactionsData.success) setTransactions(transactionsData.data);
      
      const goalsData = await goalsRes.json();
      if (goalsData.success) setSavingsGoals(goalsData.data);

      const debtsData = await debtsRes.json();
      if (debtsData.success) setDebts(debtsData.data);
      
      const lendingData = await lendingRes.json();
      if (lendingData.success) setLending(lendingData.data);

      const budgetsData = await budgetsRes.json();
      if (budgetsData.success) setBudgets(budgetsData.data);

      const balancesData = await balancesRes.json();
      if (balancesData.success) setBalances(balancesData.data);

    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApiCall = async <T, U>(endpoint: string, method: 'POST' | 'PUT' | 'DELETE', body: T): Promise<U | null> => {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        console.error(`Failed to ${method} ${endpoint}:`, result.error);
        return null;
      }
    } catch (error) {
      console.error(`Error in ${method} ${endpoint}:`, error);
      return null;
    }
  }

  const updateBalances = async (newBalances: Balances) => {
    const updatedBalances = await handleApiCall<Balances, Balances>('/api/balances', 'PUT', newBalances);
    if(updatedBalances) {
        setBalances(updatedBalances);
    }
  }

  const adjustBalance = async (transaction: Omit<Transaction, 'id' | '_id'>, factor: 1 | -1) => {
      const amount = transaction.amount * factor;
      const newBalances = { ...balances };

      switch (transaction.paymentMethod) {
          case 'card':
          case 'other':
              newBalances.bank += amount;
              break;
          case 'upi':
              newBalances.upi += amount;
              break;
          case 'cash':
              newBalances.cash += amount;
              break;
      }
      await updateBalances(newBalances);
  }


  // Transactions
  const addTransaction = async (transaction: Omit<Transaction, 'id' | '_id'>) => {
    const newTransaction = await handleApiCall<Omit<Transaction, 'id' | '_id'>, Transaction>('/api/transactions', 'POST', transaction);
    if (newTransaction) {
      setTransactions(prev => [newTransaction, ...prev]);
      const factor = transaction.type === 'income' ? 1 : -1;
      await adjustBalance(transaction, factor);
    }
  };
  const updateTransaction = async (updatedTransaction: Transaction) => {
    const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
    if(!originalTransaction) return;

    const result = await handleApiCall<Transaction, Transaction>('/api/transactions', 'PUT', updatedTransaction);
    if (result) {
      // Revert old transaction amount
      const oldFactor = originalTransaction.type === 'income' ? -1 : 1;
      await adjustBalance(originalTransaction, oldFactor);
      // Apply new transaction amount
      const newFactor = updatedTransaction.type === 'income' ? 1 : -1;
      await adjustBalance(updatedTransaction, newFactor);

      setTransactions(prev => prev.map(t => (t.id === result.id ? result : t)));
    }
  };
  const deleteTransaction = async (transactionToDelete: Transaction) => {
    const result = await handleApiCall<{ id: string | number }, any>('/api/transactions', 'DELETE', { id: transactionToDelete.id });
    if (result) {
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
      const factor = transactionToDelete.type === 'income' ? -1 : 1;
      await adjustBalance(transactionToDelete, factor);
    }
  };

  // Goals
  const addGoal = async (goal: Omit<SavingsGoal, 'id' | '_id'>) => {
    const newGoal = await handleApiCall<Omit<SavingsGoal, 'id' | '_id'>, SavingsGoal>('/api/goals', 'POST', goal);
    if (newGoal) setSavingsGoals(prev => [newGoal, ...prev]);
  };
  const updateGoal = async (updatedGoal: SavingsGoal) => {
    const result = await handleApiCall<SavingsGoal, SavingsGoal>('/api/goals', 'PUT', updatedGoal);
    if (result) setSavingsGoals(prev => prev.map(g => (g.id === result.id ? result : g)));
  };
  const deleteGoal = async (goalToDelete: SavingsGoal) => {
    const result = await handleApiCall<{ id: string }, any>('/api/goals', 'DELETE', { id: goalToDelete.id });
    if (result) setSavingsGoals(prev => prev.filter(g => g.id !== goalToDelete.id));
  };
  
  // Debts
  const addDebt = async (debt: Omit<Debt, 'id' | '_id'>) => {
    const newDebt = await handleApiCall<Omit<Debt, 'id' | '_id'>, Debt>('/api/debts', 'POST', debt);
    if (newDebt) setDebts(prev => [newDebt, ...prev]);
  };
  const updateDebt = async (updatedDebt: Debt) => {
    const result = await handleApiCall<Debt, Debt>('/api/debts', 'PUT', updatedDebt);
    if (result) setDebts(prev => prev.map(d => (d.id === result.id ? result : d)));
  };
  const deleteDebt = async (debtToDelete: Debt) => {
    const result = await handleApiCall<{ id: string }, any>('/api/debts', 'DELETE', { id: debtToDelete.id });
    if (result) setDebts(prev => prev.filter(d => d.id !== debtToDelete.id));
  };

  // Lending
  const addLending = async (lendingItem: Omit<Lending, 'id' | '_id'>) => {
    const newLending = await handleApiCall<Omit<Lending, 'id' | '_id'>, Lending>('/api/lending', 'POST', lendingItem);
    if (newLending) setLending(prev => [newLending, ...prev]);
  };
  const updateLending = async (updatedLending: Lending) => {
    const result = await handleApiCall<Lending, Lending>('/api/lending', 'PUT', updatedLending);
    if (result) setLending(prev => prev.map(l => (l.id === result.id ? result : l)));
  };
  const deleteLending = async (lendingToDelete: Lending) => {
    const result = await handleApiCall<{ id: string }, any>('/api/lending', 'DELETE', { id: lendingToDelete.id });
    if (result) setLending(prev => prev.filter(l => l.id !== lendingToDelete.id));
  };

  // Budgets
  const addBudget = async (budget: Omit<Budget, 'id' | '_id'>) => {
    const newBudget = await handleApiCall<Omit<Budget, 'id' | '_id'>, Budget>('/api/budgets', 'POST', budget);
    if (newBudget) setBudgets(prev => [newBudget, ...prev]);
  };
  const updateBudget = async (updatedBudget: Budget) => {
    const result = await handleApiCall<Budget, Budget>('/api/budgets', 'PUT', updatedBudget);
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
    updateBalances,
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
