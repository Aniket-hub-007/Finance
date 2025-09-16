
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Transaction, Balances, SavingsGoal, Debt, Lending } from '@/lib/types';
import { 
  savingsGoals as initialSavingsGoals,
  debts as initialDebts,
  lending as initialLending
} from '@/lib/data';

interface AppContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | '_id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (transaction: Transaction) => Promise<void>;
  balances: Balances;
  setBalances: (balances: Balances) => void;
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  lending: Lending[];
  setLending: (lending: Lending[]) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Define base balances that are not affected by transactions history for demo purposes
const baseBalances: Balances = {
  bank: 12050.75,
  upi: 2500.50,
  cash: 850.00,
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<Balances>(baseBalances);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialSavingsGoals);
  const [debts, setDebts] = useState<Debt[]>(initialDebts);
  const [lending, setLending] = useState<Lending[]>(initialLending);
  const [isLoading, setIsLoading] = useState(true);

  const recalculateBalances = (allTransactions: Transaction[]) => {
    const adjustments = allTransactions.reduce((acc, t) => {
        const amount = t.type === 'income' ? t.amount : -t.amount;
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

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/transactions');
        const result = await response.json();
        if (result.success) {
          const fetchedTransactions = result.data.map((tx: any) => ({ ...tx, id: tx._id }));
          setTransactions(fetchedTransactions);
          recalculateBalances(fetchedTransactions);
        } else {
          console.error("Failed to fetch transactions:", result.error);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | '_id'>) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      const result = await response.json();
      if (result.success) {
        const newTransaction = { ...result.data, id: result.data._id };
        setTransactions(prev => {
          const newTransactions = [newTransaction, ...prev];
          recalculateBalances(newTransactions);
          return newTransactions;
        });
      } else {
        console.error("Failed to add transaction:", result.error);
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTransaction),
      });
      const result = await response.json();
      if (result.success) {
        setTransactions(prev => {
          const newTransactions = prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t));
          recalculateBalances(newTransactions);
          return newTransactions;
        });
      } else {
        console.error("Failed to update transaction:", result.error);
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };
  
  const deleteTransaction = async (transactionToDelete: Transaction) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transactionToDelete.id }),
      });
      const result = await response.json();
      if (result.success) {
        setTransactions(prev => {
            const newTransactions = prev.filter(t => t.id !== transactionToDelete.id)
            recalculateBalances(newTransactions);
            return newTransactions;
        });
      } else {
        console.error("Failed to delete transaction:", result.error);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const value = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    balances,
    setBalances,
    savingsGoals,
    debts,
    lending,
    setLending,
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
