
import type { LucideIcon } from "lucide-react";
import type { ObjectId } from 'mongodb';


export type Transaction = {
  id: string | number | ObjectId;
  _id?: string | number | ObjectId;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  paymentMethod: 'card' | 'cash' | 'upi' | 'other';
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
  amount: number;
  expenses: BudgetExpense[];
};

export type Balances = {
  bank: number;
  upi: number;
  cash: number;
};
