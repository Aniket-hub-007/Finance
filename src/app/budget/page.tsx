
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { budgets as initialBudgets } from "@/lib/data";
import { PlusCircle, FileText, IndianRupee } from "lucide-react";
import { useState } from "react";
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

export default function BudgetPage() {
    const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(undefined);

     const handleAdd = () => {
        setSelectedBudget(undefined);
        setIsFormOpen(true);
    }

    const handleEdit = (budget: Budget) => {
        setSelectedBudget(budget);
        setIsFormOpen(true);
    }

    const handleDelete = (id: string | number) => {
        setBudgets(budgets.filter(d => d.id !== id));
    }

    const handleFormSubmit = (budget: Budget) => {
        if(selectedBudget) {
            setBudgets(budgets.map(b => b.id === budget.id ? budget : b));
        } else {
            setBudgets([...budgets, { ...budget, id: Date.now() }]);
        }
        setIsFormOpen(false);
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
            <div className="grid gap-6">
                {budgets.map(budget => {
                    const totalExpenses = budget.expenses.reduce((acc, expense) => acc + expense.amount, 0);
                    return (
                        <Card key={budget.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="font-headline">{budget.name}</CardTitle>
                                        <CardDescription>
                                            Total: <span className="font-bold">₹{totalExpenses.toLocaleString()}</span>
                                        </CardDescription>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
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
                            </CardContent>
                             <CardFooter className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(budget)}>Edit</Button>
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(budget.id)}>Delete</Button>
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

