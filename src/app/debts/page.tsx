
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreditCard, PlusCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Debt } from "@/lib/types";
import { DebtForm } from "@/components/debts/debt-form";
import { useAppContext } from "@/context/app-provider";

export default function DebtsPage() {
    const { debts, addDebt, updateDebt, deleteDebt, isLoading } = useAppContext();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState<Debt | undefined>(undefined);

     const handleAdd = () => {
        setSelectedDebt(undefined);
        setIsFormOpen(true);
    }

    const handleEdit = (debt: Debt) => {
        setSelectedDebt(debt);
        setIsFormOpen(true);
    }

    const handleDelete = async (debt: Debt) => {
        await deleteDebt(debt);
    }

    const handleFormSubmit = async (debt: Omit<Debt, 'id' | '_id'>) => {
        if(selectedDebt) {
            await updateDebt({ ...debt, id: selectedDebt.id, _id: selectedDebt._id });
        } else {
            await addDebt(debt);
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
                    <h1 className="text-3xl font-headline font-semibold">Debt Management</h1>
                    <p className="text-muted-foreground">Add debts and track your payoff progress.</p>
                </div>
                 <Button size="sm" className="gap-1" onClick={handleAdd}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    New Debt
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {debts.map(debt => {
                    const progress = ((debt.initialAmount - debt.currentBalance) / debt.initialAmount) * 100;
                    return (
                        <Card key={debt.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="font-headline">{debt.name}</CardTitle>
                                        <CardDescription>{debt.interestRate}% Interest Rate</CardDescription>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-2xl font-bold">₹{debt.currentBalance.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    Remaining of ₹{debt.initialAmount.toLocaleString()}
                                </p>
                                <Progress value={progress} />
                                <p className="text-sm text-muted-foreground">{progress.toFixed(1)}% paid off</p>
                            </CardContent>
                             <CardFooter className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(debt)}>Edit</Button>
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(debt)}>Delete</Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
            <DebtForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSubmit={handleFormSubmit}
                debt={selectedDebt}
            />
        </div>
    );
}
