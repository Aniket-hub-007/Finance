
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Smartphone, Landmark, Plus, PiggyBank, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Pie, PieChart, Cell } from 'recharts';
import { ChartTooltip, ChartTooltipContent, ChartContainer, ChartConfig, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { subDays, format, startOfMonth, eachMonthOfInterval, subMonths, parseISO, isAfter } from 'date-fns';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { BalanceEditForm } from '@/components/dashboard/balance-edit-form';
import { useAppContext } from '@/context/app-provider';
import type { Balance, Transaction } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const chartConfig = {
  balance: {
    label: 'Balance',
    color: 'hsl(var(--chart-1))',
  },
  expense: {
    label: 'Expense',
    color: 'hsl(var(--destructive))',
  },
  savings: {
    label: 'Savings',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { balances, addBalance, transactions, savingsGoals, debts, lending } = useAppContext();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('all');

  const latestBalance = useMemo(() => balances.length > 0 ? balances[0] : { bank: 0, upi: 0, cash: 0, date: new Date().toISOString() }, [balances]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;
      const paymentModeMatch = selectedPaymentMode === 'all' || t.paymentMethod === selectedPaymentMode;
      return categoryMatch && paymentModeMatch;
    });
  }, [transactions, selectedCategory, selectedPaymentMode]);

  const adjustedBalances = useMemo(() => {
    if (!latestBalance.date) {
        return { bank: 0, upi: 0, cash: 0, date: new Date().toISOString() };
    }
    const lastBalanceDate = parseISO(latestBalance.date);
    const recentTransactions = transactions.filter(t => t.date && isAfter(parseISO(t.date), lastBalanceDate) && t.type === 'expense');

    let adjustedBank = latestBalance.bank;
    let adjustedUpi = latestBalance.upi;
    let adjustedCash = latestBalance.cash;

    recentTransactions.forEach(t => {
        switch(t.paymentMethod) {
            case 'card':
            case 'other':
                adjustedBank -= t.amount;
                break;
            case 'upi':
                adjustedUpi -= t.amount;
                break;
            case 'cash':
                adjustedCash -= t.amount;
                break;
        }
    });

    return { ...latestBalance, bank: adjustedBank, upi: adjustedUpi, cash: adjustedCash };
  }, [latestBalance, transactions]);
  
  const totalBalance = adjustedBalances.bank + adjustedBalances.upi + adjustedBalances.cash;
  
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const totalSavings = savingsGoals.reduce((acc, goal) => acc + goal.currentAmount, 0);
  const totalDebts = debts.reduce((acc, debt) => acc + debt.currentBalance, 0);
  const totalLent = lending.filter(l => l.status === 'Pending').reduce((acc, l) => acc + l.amount, 0);

  const expenseCategories = useMemo(() => {
    const categories = new Set(transactions.filter(t => t.type === 'expense').map(t => t.category));
    return ['all', ...Array.from(categories)];
  }, [transactions]);
  
  const paymentMethods = useMemo(() => {
    const methods = new Set(transactions.map(t => t.paymentMethod));
    return ['all', ...Array.from(methods)];
  }, [transactions]);


  const expensesByCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!categoryMap[t.category]) {
          categoryMap[t.category] = 0;
        }
        categoryMap[t.category] += t.amount;
      });

    return Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
    }));
  }, [filteredTransactions]);

  const categoryChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    expensesByCategory.forEach((item, index) => {
      config[item.category] = {
        label: item.category,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });
    return config;
  }, [expensesByCategory]);


  const handleBalanceUpdate = async (newBalance: Omit<Balance, 'id' | '_id'>) => {
    await addBalance(newBalance);
    setIsEditFormOpen(false);
  };

  // Data processing for charts
  const today = new Date();
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const day = format(date, 'EEE');
    const dailyExpenses = filteredTransactions
      .filter(t => t.type === 'expense' && t.date && new Date(t.date).toDateString() === date.toDateString())
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const dailySavings = savingsGoals.reduce((acc, goal) => acc + (goal.currentAmount / 30), 0) / 7; // simplified
    
    const balanceOnDate = balances.find(b => b.date && format(parseISO(b.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    const balance = balanceOnDate ? balanceOnDate.bank + balanceOnDate.upi + balanceOnDate.cash : 0;
    
    return { name: day, expense: dailyExpenses, savings: dailySavings, balance };
  });

  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const week = `Week ${i + 1}`;
    const weeklyExpenses = filteredTransactions
        .filter(t => t.date && new Date(t.date) > subDays(today, (4-i)*7) && new Date(t.date) <= subDays(today, (3-i)*7))
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const weeklySavings = savingsGoals.reduce((acc, goal) => acc + (goal.currentAmount / 4), 0); // simplified
    const balance = totalBalance - (weeklyExpenses * (4-i)); // simplified
    return { name: week, expense: weeklyExpenses, savings: weeklySavings, balance: balance };
  });

  const last4Months = eachMonthOfInterval({
    start: subMonths(startOfMonth(today), 3),
    end: startOfMonth(today)
  });

  const monthlyData = last4Months.map(month => {
    const monthName = format(month, 'MMM');
    const monthlyExpenses = filteredTransactions
      .filter(t => t.type === 'expense' && t.date && format(parseISO(t.date), 'yyyy-MM') === format(month, 'yyyy-MM'))
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    
    const monthlySavings = savingsGoals.reduce((acc, goal) => acc + (goal.currentAmount / 4), 0); 

    const balanceEntryForMonth = balances.find(b => b.date && format(parseISO(b.date), 'yyyy-MM') === format(month, 'yyyy-MM'));
    const balance = balanceEntryForMonth ? balanceEntryForMonth.bank + balanceEntryForMonth.upi + balanceEntryForMonth.cash : 0;

    return { name: monthName, expense: monthlyExpenses, savings: monthlySavings, balance: balance };
  });
  
  const renderChart = (data: any[], key: string, color: string, title: string) => (
     <Card>
        <CardHeader>
            <CardTitle className="font-headline text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data} accessibilityLayer>
                     <CartesianGrid vertical={false} />
                     <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => `₹${value}`}
                    />
                    <RechartsTooltip 
                        content={<ChartTooltipContent />}
                        cursor={{fill: 'hsl(var(--muted))'}}
                    />
                    <Line type="monotone" dataKey={key} stroke={color} fill={color} strokeWidth={2} dot={{r: 4}} name={key} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
     </Card>
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditFormOpen(true)}>
                <Plus className="h-4 w-4 text-muted-foreground" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Latest on {latestBalance.date ? format(parseISO(latestBalance.date), 'PPP') : 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bank Balance</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{adjustedBalances.bank.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">In your bank accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">UPI Balance</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{adjustedBalances.upi.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">In your UPI apps</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash on Hand</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{adjustedBalances.cash.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Physical cash</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {selectedCategory !== 'all' ? `in ${selectedCategory}` : 'This month'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">₹{totalSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all goals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalDebts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Remaining balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Money Lent</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalLent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pending repayment</p>
          </CardContent>
        </Card>
      </div>

       <Card className="mt-8">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter expenses by category and payment method.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category-filter">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment-mode-filter">Payment Mode</Label>
                <Select value={selectedPaymentMode} onValueChange={setSelectedPaymentMode}>
                  <SelectTrigger id="payment-mode-filter">
                    <SelectValue placeholder="Select a payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                     {paymentMethods.map(method => (
                      <SelectItem key={method} value={method} className="capitalize">{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
        </CardContent>
      </Card>
      
       <Tabs defaultValue="monthly" className="w-full mt-8">
            <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
                <div className="grid gap-4 mt-4 md:grid-cols-1 lg:grid-cols-3">
                    {renderChart(dailyData, 'balance', 'hsl(var(--primary))', 'Balance Overview (Last 7 Days)')}
                    {renderChart(dailyData, 'expense', 'hsl(var(--destructive))', 'Expense Overview (Last 7 Days)')}
                    {renderChart(dailyData, 'savings', 'hsl(var(--accent))', 'Savings Overview (Last 7 Days)')}
                </div>
            </TabsContent>
            <TabsContent value="weekly">
                 <div className="grid gap-4 mt-4 md:grid-cols-1 lg:grid-cols-3">
                    {renderChart(weeklyData, 'balance', 'hsl(var(--primary))', 'Balance Overview (Last 4 Weeks)')}
                    {renderChart(weeklyData, 'expense', 'hsl(var(--destructive))', 'Expense Overview (Last 4 Weeks)')}
                    {renderChart(weeklyData, 'savings', 'hsl(var(--accent))', 'Savings Overview (Last 4 Weeks)')}
                </div>
            </TabsContent>
            <TabsContent value="monthly">
                 <div className="grid gap-4 mt-4 md:grid-cols-1 lg:grid-cols-3">
                    {renderChart(monthlyData, 'balance', 'hsl(var(--primary))', 'Balance Overview (Last 4 Months)')}
                    {renderChart(monthlyData, 'expense', 'hsl(var(--destructive))', 'Expense Overview (Last 4 Months)')}
                    {renderChart(monthlyData, 'savings', 'hsl(var(--accent))', 'Savings Overview (Last 4 Months)')}
                </div>
            </TabsContent>
        </Tabs>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 mt-8">
        <div className="xl:col-span-2">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Recent Transactions</CardTitle>
               <CardDescription>
                Your latest financial activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.slice(0, 5).map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="font-medium">{tx.description}</div>
                        <div className="text-xs text-muted-foreground">{tx.date ? format(parseISO(tx.date), 'PPP') : ''}</div>
                      </TableCell>
                       <TableCell>{tx.category}</TableCell>
                      <TableCell className={`text-right font-medium ${tx.type === 'income' ? 'text-accent' : 'text-destructive'}`}>
                        {tx.type === 'income' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Expenses by Category</CardTitle>
                <CardDescription>A breakdown of your spending by category.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={categoryChartConfig} className="min-h-[200px] w-full">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="amount" hideLabel />} />
                        <Pie data={expensesByCategory} dataKey="amount" nameKey="category" innerRadius={60}>
                            {expensesByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={categoryChartConfig[entry.category]?.color} />
                            ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>

        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Active Savings Goals</CardTitle>
              <CardDescription>
                Your progress towards your financial goals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savingsGoals.map(goal => (
                <div key={goal.id} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{goal.name}</span>
                        <span className="text-xs text-muted-foreground">
                            ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                        </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                        ></div>
                    </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <BalanceEditForm
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSubmit={handleBalanceUpdate}
        currentBalance={latestBalance}
      />
    </>
  );
}
