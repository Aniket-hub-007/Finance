
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, FileText, Loader2, TrendingDown, Wallet, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import type { Budget } from "@/lib/types";
import { BudgetForm } from "@/components/budget/budget-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/app-provider";
import { startOfMonth, endOfMonth, format } from 'date-fns';

export default function BudgetPage() {
    const { budgets, addBudget, updateBudget, deleteBudget, isLoading } = useAppContext();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(undefined);

    const { monthlySpent, remainingBudget, overspentBudgetsCount } = useMemo(() => {
        let monthlySpent = 0;
        let totalBudget = 0;
        let overspentBudgetsCount = 0;

        budgets.forEach(budget => {
            const totalExpenses = budget.expenses.reduce((acc, expense) => acc + expense.amount, 0);
            monthlySpent += totalExpenses;
            totalBudget += budget.amount;
            if (totalExpenses > budget.amount) {
                overspentBudgetsCount++;
            }
        });

        const remainingBudget = totalBudget - monthlySpent;

        return { monthlySpent, remainingBudget, overspentBudgetsCount };
    }, [budgets]);

    const monthStartDate = format(startOfMonth(new Date()), 'MMMM d, yyyy');
    const monthEndDate = format(endOfMonth(new Date()), 'MMMM d, yyyy');

     const handleAdd = () => {
        setSelectedBudget(undefined);
        setIsFormOpen(true);
    }

    const handleEdit = (budget: Budget) => {
        setSelectedBudget(budget);
        setIsFormOpen(true);
    }

    const handleDelete = async (budget: Budget) => {
        await deleteBudget(budget);
    }

    const handleFormSubmit = async (budget: Omit<Budget, 'id' | '_id'>) => {
        if(selectedBudget) {
            await updateBudget({ ...budget, id: selectedBudget.id, _id: selectedBudget._id });
        } else {
            await addBudget(budget);
        }
        setIsFormOpen(false);
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-headline font-semibold">Budgets</h1>
                    <p className="text-muted-foreground">Create and manage your budgets.</p>
                </div>
                 <Button size="sm" className="gap-1" onClick={handleAdd}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    New Budget
                </Button>
            </div>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Monthly Budget Summary</CardTitle>
                    <CardDescription>{monthStartDate} - {monthEndDate}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-4 rounded-lg border p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <TrendingDown className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Monthly Spent</p>
                            <p className="text-2xl font-bold">₹{monthlySpent.toLocaleString()}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 rounded-lg border p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Remaining</p>
                            <p className="text-2xl font-bold">₹{remainingBudget.toLocaleString()}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 rounded-lg border p-4">
                         <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Over Budgets</p>
                            <p className="text-2xl font-bold">{overspentBudgetsCount}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6">
                {budgets.map(budget => {
                    const totalExpenses = budget.expenses.reduce((acc, expense) => acc + expense.amount, 0);
                    const remaining = budget.amount - totalExpenses;
                    const progress = (totalExpenses / budget.amount) * 100;

                    return (
                        <Card key={budget.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="font-headline">{budget.name}</CardTitle>
                                        <CardDescription>
                                            Budget: <span className="font-bold">₹{budget.amount.toLocaleString()}</span>
                                        </CardDescription>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-muted-foreground">Spent: <span className="font-semibold text-foreground">₹{totalExpenses.toLocaleString()}</span></p>
                                            <p className={cn(
                                                "font-semibold",
                                                remaining >= 0 ? "text-accent" : "text-destructive"
                                            )}>
                                                {remaining >= 0 ? `₹${remaining.toLocaleString()} under` : `₹${Math.abs(remaining).toLocaleString()} over`}
                                            </p>
                                        </div>
                                        <Progress value={progress} />
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Category</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {budget.expenses.map((expense, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{expense.category}</TableCell>
                                                    <TableCell className="text-right">₹{expense.amount.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                             <CardFooter className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(budget)}>Edit</Button>
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(budget)}>Delete</Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
            <BudgetForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSubmit={handleFormSubmit}
                budget={selectedBudget}
            />
        </div>
    );
}
