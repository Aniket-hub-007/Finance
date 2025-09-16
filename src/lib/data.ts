
import type { NavItem } from './types';
import {
  LayoutDashboard,
  ArrowRightLeft,
  PiggyBank,
  CreditCard,
  Landmark,
  TrendingUp,
  Calculator,
  DollarSign,
} from 'lucide-react';

export const navItems: NavItem[] = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: ArrowRightLeft, label: 'Transactions' },
  { href: '/earnings', icon: DollarSign, label: 'Earnings' },
  { href: '/budget', icon: Calculator, label: 'Budget' },
  { href: '/reports', icon: TrendingUp, label: 'Reports' },
  { href: '/goals', icon: PiggyBank, label: 'Goals' },
  { href: '/debts', icon: CreditCard, label: 'Debts' },
  { href: '/lending', icon: Landmark, label: 'Lending' },
];
