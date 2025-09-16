
import type { LucideIcon } from "lucide-react";

export type Transaction = {
  id: string;
  _id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  paymentMethod: 'card' | 'cash' | 'upi' | 'other';
};

export type SavingsGoal = {
  id: string;
  _id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  deadline?: string;
};

export type Debt = {
  id: string;
  _id: string;
  name: string;
  initialAmount: number;
  currentBalance: number;
  interestRate: number;
};

export type Lending = {
    id: string;
    _id: string;
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
  id: string;
  _id: string;
  name: string;
  amount: number;
  expenses: BudgetExpense[];
};

export type Balances = {
  id?: string;
  _id?: string;
  bank: number;
  upi: number;
  cash: number;
};
