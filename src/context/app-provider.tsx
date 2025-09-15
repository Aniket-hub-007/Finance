
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Transaction, Balances, SavingsGoal } from '@/lib/types';
import { transactions as initialTransactions, savingsGoals as initialSavingsGoals } from '@/lib/data';

interface AppContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transaction: Transaction) => void;
  balances: Balances;
  setBalances: (balances: Balances) => void;
  savingsGoals: SavingsGoal[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [balances, setBalances] = useState<Balances>({
    bank: 12050.75,
    upi: 2500.50,
    cash: 850.00,
  });
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialSavingsGoals);
  
  const updateBalanceOnTransaction = (transaction: Transaction, factor: 1 | -1) => {
    const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
    const balanceChange = amount * factor;

    setBalances(prevBalances => {
      const newBalances = { ...prevBalances };
      switch (transaction.paymentMethod) {
        case 'upi':
          newBalances.upi += balanceChange;
          break;
        case 'cash':
          newBalances.cash += balanceChange;
          break;
        case 'card':
        case 'other':
          newBalances.bank += balanceChange;
          break;
      }
      return newBalances;
    });
  };


  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    updateBalanceOnTransaction(transaction, 1);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
    if (originalTransaction) {
      // Revert the original transaction's effect
      updateBalanceOnTransaction(originalTransaction, -1);
    }
    // Apply the new transaction's effect
    updateBalanceOnTransaction(updatedTransaction, 1);

    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };
  
  const deleteTransaction = (transactionToDelete: Transaction) => {
     // Revert the transaction's effect
    updateBalanceOnTransaction(transactionToDelete, -1);
    setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
  };

  const value = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    balances,
    setBalances,
    savingsGoals,
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
