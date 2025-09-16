
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Transaction, Balance, SavingsGoal, Debt, Lending, Budget, Earning } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | '_id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (transaction: Transaction) => Promise<void>;
  
  balances: Balance[];
  addBalance: (balance: Omit<Balance, 'id' | '_id'>) => Promise<void>;
  
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

  earnings: Earning[];
  addEarning: (earning: Omit<Earning, 'id' | '_id'>) => Promise<void>;
  updateEarning: (earning: Earning) => Promise<void>;
  deleteEarning: (earning: Earning) => Promise<void>;

  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [lending, setLending] = useState<Lending[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [transactionsRes, balancesRes, goalsRes, debtsRes, lendingRes, budgetsRes, earningsRes] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/balances'),
          fetch('/api/goals'),
          fetch('/api/debts'),
          fetch('/api/lending'),
          fetch('/api/budgets'),
          fetch('/api/earnings'),
        ]);

        const transactionsData = await transactionsRes.json();
        if (transactionsData.success) {
          setTransactions(transactionsData.data.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }

        const balancesData = await balancesRes.json();
        if (balancesData.success) {
            setBalances(balancesData.data);
        }
        
        const goalsData = await goalsRes.json();
        if (goalsData.success) setSavingsGoals(goalsData.data);

        const debtsData = await debtsRes.json();
        if (debtsData.success) setDebts(debtsData.data);

        const lendingData = await lendingRes.json();
        if (lendingData.success) setLending(lendingData.data);

        const budgetsData = await budgetsRes.json();
        if (budgetsData.success) setBudgets(budgetsData.data);
        
        const earningsData = await earningsRes.json();
        if (earningsData.success) setEarnings(earningsData.data);

      } catch (error) {
        console.error("Failed to fetch data", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data from the server.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);


  const apiRequest = async (url: string, method: string, body?: any) => {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'API request failed' }));
      throw new Error(errorData.error || `API request failed: ${method} ${url}`);
    }
    return response.json();
  }
  
  // Balances
  const addBalance = async (balance: Omit<Balance, 'id' | '_id'>) => {
    try {
      const result = await apiRequest('/api/balances', 'POST', balance);
      if (result.success) {
        setBalances(prev => [result.data, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        toast({ title: "Success", description: "Balance record added." });
      }
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Failed to add balance record." });
    }
  };

  // Transactions
  const addTransaction = async (transaction: Omit<Transaction, 'id' | '_id'>) => {
    try {
      const result = await apiRequest('/api/transactions', 'POST', transaction);
      if(result.success) {
        setTransactions(prev => [result.data, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        toast({ title: "Success", description: "Transaction added." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add transaction." });
    }
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    try {
      const result = await apiRequest('/api/transactions', 'PUT', updatedTransaction);
      if(result.success) {
        setTransactions(prev => prev.map(t => (t.id === updatedTransaction.id ? result.data : t)));
        toast({ title: "Success", description: "Transaction updated." });
      }
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Failed to update transaction." });
    }
  };

  const deleteTransaction = async (transactionToDelete: Transaction) => {
    try {
      await apiRequest('/api/transactions', 'DELETE', { id: transactionToDelete.id });
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
      toast({ title: "Success", description: "Transaction deleted." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete transaction." });
    }
  };

  // Goals
  const addGoal = async (goal: Omit<SavingsGoal, 'id' | '_id'>) => {
     try {
      const result = await apiRequest('/api/goals', 'POST', goal);
      if(result.success) {
        setSavingsGoals(prev => [result.data, ...prev]);
        toast({ title: "Success", description: "Goal added." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add goal." });
    }
  };
  const updateGoal = async (updatedGoal: SavingsGoal) => {
     try {
      const result = await apiRequest('/api/goals', 'PUT', updatedGoal);
      if(result.success) {
        setSavingsGoals(prev => prev.map(g => (g.id === updatedGoal.id ? result.data : g)));
        toast({ title: "Success", description: "Goal updated." });
      }
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Failed to update goal." });
    }
  };
  const deleteGoal = async (goalToDelete: SavingsGoal) => {
    try {
      await apiRequest('/api/goals', 'DELETE', { id: goalToDelete.id });
      setSavingsGoals(prev => prev.filter(g => g.id !== goalToDelete.id));
      toast({ title: "Success", description: "Goal deleted." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete goal." });
    }
  };
  
  // Debts
  const addDebt = async (debt: Omit<Debt, 'id' | '_id'>) => {
    try {
      const result = await apiRequest('/api/debts', 'POST', debt);
      if(result.success) {
        setDebts(prev => [result.data, ...prev]);
        toast({ title: "Success", description: "Debt added." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add debt." });
    }
  };
  const updateDebt = async (updatedDebt: Debt) => {
    try {
      const result = await apiRequest('/api/debts', 'PUT', updatedDebt);
      if(result.success) {
        setDebts(prev => prev.map(d => (d.id === updatedDebt.id ? result.data : d)));
        toast({ title: "Success", description: "Debt updated." });
      }
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Failed to update debt." });
    }
  };
  const deleteDebt = async (debtToDelete: Debt) => {
    try {
      await apiRequest('/api/debts', 'DELETE', { id: debtToDelete.id });
      setDebts(prev => prev.filter(d => d.id !== debtToDelete.id));
      toast({ title: "Success", description: "Debt deleted." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete debt." });
    }
  };

  // Lending
  const addLending = async (lendingItem: Omit<Lending, 'id' | '_id'>) => {
    try {
      const result = await apiRequest('/api/lending', 'POST', lendingItem);
      if(result.success) {
        setLending(prev => [result.data, ...prev]);
        toast({ title: "Success", description: "Lending entry added." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add lending entry." });
    }
  };
  const updateLending = async (updatedLending: Lending) => {
    try {
      const result = await apiRequest('/api/lending', 'PUT', updatedLending);
      if(result.success) {
        setLending(prev => prev.map(l => (l.id === updatedLending.id ? result.data : l)));
        toast({ title: "Success", description: "Lending entry updated." });
      }
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Failed to update lending entry." });
    }
  };
  const deleteLending = async (lendingToDelete: Lending) => {
     try {
      await apiRequest('/api/lending', 'DELETE', { id: lendingToDelete.id });
      setLending(prev => prev.filter(l => l.id !== lendingToDelete.id));
      toast({ title: "Success", description: "Lending entry deleted." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete lending entry." });
    }
  };

  // Budgets
  const addBudget = async (budget: Omit<Budget, 'id' | '_id'>) => {
    try {
      const result = await apiRequest('/api/budgets', 'POST', budget);
      if(result.success) {
        setBudgets(prev => [result.data, ...prev]);
        toast({ title: "Success", description: "Budget added." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add budget." });
    }
  };
  const updateBudget = async (updatedBudget: Budget) => {
    try {
      const result = await apiRequest('/api/budgets', 'PUT', updatedBudget);
      if(result.success) {
        setBudgets(prev => prev.map(b => (b.id === updatedBudget.id ? result.data : b)));
        toast({ title: "Success", description: "Budget updated." });
      }
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Failed to update budget." });
    }
  };
  const deleteBudget = async (budgetToDelete: Budget) => {
    try {
      await apiRequest('/api/budgets', 'DELETE', { id: budgetToDelete.id });
      setBudgets(prev => prev.filter(b => b.id !== budgetToDelete.id));
      toast({ title: "Success", description: "Budget deleted." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete budget." });
    }
  };
  
    // Earnings
    const addEarning = async (earning: Omit<Earning, 'id' | '_id'>) => {
      try {
        const result = await apiRequest('/api/earnings', 'POST', earning);
        if (result.success) {
          setEarnings((prev) => [result.data, ...prev]);
          toast({ title: 'Success', description: 'Earning added.' });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to add earning.',
        });
      }
    };
    const updateEarning = async (updatedEarning: Earning) => {
      try {
        const result = await apiRequest('/api/earnings', 'PUT', updatedEarning);
        if (result.success) {
          setEarnings((prev) =>
            prev.map((e) => (e.id === updatedEarning.id ? result.data : e))
          );
          toast({ title: 'Success', description: 'Earning updated.' });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update earning.',
        });
      }
    };
    const deleteEarning = async (earningToDelete: Earning) => {
      try {
        await apiRequest('/api/earnings', 'DELETE', { id: earningToDelete.id });
        setEarnings((prev) => prev.filter((e) => e.id !== earningToDelete.id));
        toast({ title: 'Success', description: 'Earning deleted.' });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete earning.',
        });
      }
    };

  const value = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    balances,
    addBalance,
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
    earnings,
    addEarning,
    updateEarning,
    deleteEarning,
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
