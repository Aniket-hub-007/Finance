
import type { Transaction, SavingsGoal, Debt, NavItem, Budget, Lending } from './types';
import {
  LayoutDashboard,
  ArrowRightLeft,
  PiggyBank,
  CreditCard,
  Landmark,
  TrendingUp,
  Calculator,
} from 'lucide-react';

export const navItems: NavItem[] = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: ArrowRightLeft, label: 'Transactions' },
  { href: '/budget', icon: Calculator, label: 'Budget' },
  { href: '/reports', icon: TrendingUp, label: 'Reports' },
  { href: '/goals', icon: PiggyBank, label: 'Goals' },
  { href: '/debts', icon: CreditCard, label: 'Debts' },
  { href: '/lending', icon: Landmark, label: 'Lending' },
];

export const transactions: Transaction[] = [
    { id: 1, description: 'Grocery Shopping', amount: -75.6, date: '2024-07-28', type: 'expense', category: 'Food', paymentMethod: 'card' },
    { id: 2, description: 'Salary', amount: 3000, date: '2024-07-25', type: 'income', category: 'Job', paymentMethod: 'other' },
    { id: 3, description: 'Netflix Subscription', amount: -15.99, date: '2024-07-24', type: 'expense', category: 'Entertainment', paymentMethod: 'card' },
    { id: 4, description: 'Dinner with friends', amount: -54.2, date: '2024-07-22', type: 'expense', category: 'Social', paymentMethod: 'upi' },
    { id: 5, description: 'Freelance Project', amount: 500, date: '2024-07-20', type: 'income', category: 'Side Hustle', paymentMethod: 'other' },
    { id: 6, description: 'Gasoline', amount: -45.00, date: '2024-07-19', type: 'expense', category: 'Transport', paymentMethod: 'card' },
    { id: 7, description: 'Electricity Bill', amount: -120.50, date: '2024-07-15', type: 'expense', category: 'Utilities', paymentMethod: 'upi' },
    { id: 8, description: 'Stock Dividend', amount: 85.00, date: '2024-07-14', type: 'income', category: 'Investments', paymentMethod: 'other' },
    { id: 9, description: 'New Shoes', amount: -150.00, date: '2024-07-12', type: 'expense', category: 'Shopping', paymentMethod: 'card' },
    { id: 10, description: 'Rent', amount: -1200.00, date: '2024-07-01', type: 'expense', category: 'Housing', paymentMethod: 'other' },
];

export const recentTransactions = transactions;

export const savingsGoals: SavingsGoal[] = [
    { id: 1, name: 'Vacation to Japan', currentAmount: 2500, targetAmount: 8000, deadline: '2025-06-01' },
    { id: 2, name: 'New Laptop', currentAmount: 1200, targetAmount: 2000, deadline: '2024-12-01' },
    { id: 3, name: 'Emergency Fund', currentAmount: 7500, targetAmount: 10000 },
];

export const debts: Debt[] = [
    { id: 1, name: 'Student Loan', initialAmount: 40000, currentBalance: 25500, interestRate: 4.5 },
    { id: 2, name: 'Car Loan', initialAmount: 25000, currentBalance: 12000, interestRate: 3.2 },
    { id: 3, name: 'Credit Card', initialAmount: 5000, currentBalance: 2300, interestRate: 18.9 },
];

export const budgets: Budget[] = [
    { 
        id: 1, 
        name: 'Monthly Household Budget', 
        expenses: [
            { category: 'Rent', amount: 1500 },
            { category: 'Groceries', amount: 500 },
            { category: 'Utilities', amount: 200 },
        ]
    },
    { 
        id: 2, 
        name: 'Vacation Fund', 
        expenses: [
            { category: 'Flights', amount: 1200 },
            { category: 'Hotels', amount: 1000 },
            { category: 'Activities', amount: 600 },
        ]
    }
];

export const lending: Lending[] = [
    { id: 1, borrower: 'John Doe', amount: 500, status: 'Paid', date: '2024-05-10' },
    { id: 2, borrower: 'Jane Smith', amount: 1200, status: 'Pending', date: '2024-07-01' },
];
