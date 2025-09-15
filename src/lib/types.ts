
import type { LucideIcon } from "lucide-react";

export type Transaction = {
  id: string | number;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
};

export type SavingsGoal = {
  id: string | number;
  name: string;
  currentAmount: number;
  targetAmount: number;
  deadline?: string;
};

export type Debt = {
  id: string | number;
  name: string;
  initialAmount: number;
  currentBalance: number;
  interestRate: number;
};

export type Lending = {
    id: string | number;
    borrower: string;
    amount: number;
    status: 'Pending' | 'Paid';
    date: string;
}

export type NavItem = {
    href: string;
    icon: LucideIcon;
    label: string;
}

export type BudgetExpense = {
  category: string;
  amount: number;
};

export type Budget = {
  id: string | number;
  name: string;
  expenses: BudgetExpense[];
};
