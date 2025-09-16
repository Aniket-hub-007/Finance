
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Transaction, Balances, SavingsGoal, Debt, Lending, Budget } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Mock Data
const initialMockTransactions: Transaction[] = [
  { id: '1', _id: '1', description: 'Groceries', amount: 75.5, date: '2024-07-28', category: 'Food', type: 'expense', paymentMethod: 'card' },
  { id: '2', _id: '2', description: 'Salary', amount: 2500, date: '2024-07-27', category: 'Income', type: 'income', paymentMethod: 'other' },
  { id: '3', _id: '3', description: 'Dinner with friends', amount: 120, date: '2024-07-26', category: 'Social', type: 'expense', paymentMethod: 'upi' },
  { id: '4', _id: '4', description: 'Movie tickets', amount: 35, date: '2024-07-25', category: 'Entertainment', type: 'expense', paymentMethod: 'cash' },
];

const initialMockBalances: Balances = {
  bank: 12050.75,
  upi: 2500.50,
  cash: 850.00,
};

const initialMockGoals: SavingsGoal[] = [
  { id: '1', _id: '1', name: 'New Laptop', currentAmount: 800, targetAmount: 1500, deadline: '2024-12-31' },
  { id: '2', _id: '2', name: 'Vacation', currentAmount: 300, targetAmount: 2000, deadline: '2025-06-30' },
];

const initialMockDebts: Debt[] = [
  { id: '1', _id: '1', name: 'Credit Card', initialAmount: 5000, currentBalance: 2500, interestRate: 18.5 },
  { id: '2', _id: '2', name: 'Student Loan', initialAmount: 20000, currentBalance: 15000, interestRate: 5.8 },
];

const initialMockLending: Lending[] = [
    { id: '1', _id: '1', borrower: 'John Doe', amount: 500, status: 'Pending', date: '2024-07-20' }
];

const initialMockBudgets: Budget[] = [
    { id: '1', _id: '1', name: 'Monthly Groceries', amount: 400, expenses: [ { category: 'Groceries', amount: 250 }, { category: 'Snacks', amount: 50 } ]}
];


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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialMockTransactions);
  const [balances, setBalances] = useState<Balances>(initialMockBalances);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialMockGoals);
  const [debts, setDebts] = useState<Debt[]>(initialMockDebts);
  const [lending, setLending] = useState<Lending[]>(initialMockLending);
  const [budgets, setBudgets] = useState<Budget[]>(initialMockBudgets);
  const [isLoading, setIsLoading] = useState(false); // No need for loading state with mock data
  const { toast } = useToast();

  const updateBalances = async (newBalances: Balances) => {
    setBalances(newBalances);
    toast({ title: "Success", description: "Balances updated." });
  };
  
  const adjustBalance = async (transaction: Pick<Transaction, 'amount' | 'type' | 'paymentMethod'>, factor: 1 | -1) => {
      let amount = transaction.amount;
      if (transaction.type === 'expense') {
        amount = -amount;
      }
      
      const change = amount * factor;
      setBalances(prevBalances => {
        const newBalances = { ...prevBalances };
        switch (transaction.paymentMethod) {
            case 'card':
            case 'other':
                newBalances.bank += change;
                break;
            case 'upi':
                newBalances.upi += change;
                break;
            case 'cash':
                newBalances.cash += change;
                break;
        }
        return newBalances;
      });
  }

  // Transactions
  const addTransaction = async (transaction: Omit<Transaction, 'id' | '_id'>) => {
    const newId = (transactions.length + 1).toString();
    const newTransaction = { ...transaction, id: newId, _id: newId };
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    await adjustBalance(transaction, 1);
    toast({ title: "Success", description: "Transaction added." });
  };
  const updateTransaction = async (updatedTransaction: Transaction) => {
    const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
    if(!originalTransaction) return;

    // Revert old transaction amount
    await adjustBalance(originalTransaction, -1);
    // Apply new transaction amount
    await adjustBalance(updatedTransaction, 1);

    setTransactions(prev => prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t)));
    toast({ title: "Success", description: "Transaction updated." });
  };
  const deleteTransaction = async (transactionToDelete: Transaction) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
    await adjustBalance(transactionToDelete, -1);
    toast({ title: "Success", description: "Transaction deleted." });
  };

  // Goals
  const addGoal = async (goal: Omit<SavingsGoal, 'id' | '_id'>) => {
    const newId = (savingsGoals.length + 1).toString();
    const newGoal = { ...goal, id: newId, _id: newId };
    setSavingsGoals(prev => [newGoal, ...prev]);
    toast({ title: "Success", description: "Goal added." });
  };
  const updateGoal = async (updatedGoal: SavingsGoal) => {
    setSavingsGoals(prev => prev.map(g => (g.id === updatedGoal.id ? updatedGoal : g)));
    toast({ title: "Success", description: "Goal updated." });
  };
  const deleteGoal = async (goalToDelete: SavingsGoal) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== goalToDelete.id));
     toast({ title: "Success", description: "Goal deleted." });
  };
  
  // Debts
  const addDebt = async (debt: Omit<Debt, 'id' | '_id'>) => {
    const newId = (debts.length + 1).toString();
    const newDebt = { ...debt, id: newId, _id: newId };
    setDebts(prev => [newDebt, ...prev]);
    toast({ title: "Success", description: "Debt added." });
  };
  const updateDebt = async (updatedDebt: Debt) => {
    setDebts(prev => prev.map(d => (d.id === updatedDebt.id ? updatedDebt : d)));
    toast({ title: "Success", description: "Debt updated." });
  };
  const deleteDebt = async (debtToDelete: Debt) => {
    setDebts(prev => prev.filter(d => d.id !== debtToDelete.id));
    toast({ title: "Success", description: "Debt deleted." });
_id
  // Lending
  const addLending = async (lendingItem: Omit<Lending, 'id' | '_id'>) => {
    const newId = (lending.length + 1).toString();
    const newLending = { ...lendingItem, id: newId, _id: newId };
    setLending(prev => [newLending, ...prev]);
    toast({ title: "Success", description: "Lending entry added." });
  };
  const updateLending = async (updatedLending: Lending) => {
    setLending(prev => prev.map(l => (l.id === updatedLending.id ? updatedLending : l)));
    toast({ title: "Success", description: "Lending entry updated." });
  };
  const deleteLending = async (lendingToDelete: Lending) => {
    setLending(prev => prev.filter(l => l.id !== lendingToDelete.id));
    toast({ title: "Success", description: "Lending entry deleted." });
  };

  // Budgets
  const addBudget = async (budget: Omit<Budget, 'id' | '_id'>) => {
    const newId = (budgets.length + 1).toString();
    const newBudget = { ...budget, id: newId, _id: newId };
    setBudgets(prev => [newBudget, ...prev]);
    toast({ title: "Success", description: "Budget added." });
  };
  const updateBudget = async (updatedBudget: Budget) => {
    setBudgets(prev => prev.map(b => (b.id === updatedBudget.id ? updatedBudget : b)));
    toast({ title: "Success", description: "Budget updated." });
  };
  const deleteBudget = async (budgetToDelete: Budget) => {
    setBudgets(prev => prev.filter(b => b.id !== budgetToDelete.id));
    toast({ title: "Success", description: "Budget deleted." });
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
