
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { savingsGoals as initialSavingsGoals } from "@/lib/data";
import { PlusCircle, Target } from "lucide-react";
import { useState } from "react";
import type { SavingsGoal } from "@/lib/types";
import { GoalForm } from "@/components/goals/goal-form";


export default function GoalsPage() {
    const [goals, setGoals] = useState<SavingsGoal[]>(initialSavingsGoals);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | undefined>(undefined);

    const handleAdd = () => {
        setSelectedGoal(undefined);
        setIsFormOpen(true);
    }

    const handleEdit = (goal: SavingsGoal) => {
        setSelectedGoal(goal);
        setIsFormOpen(true);
    }

    const handleDelete = (id: string | number) => {
        setGoals(goals.filter(g => g.id !== id));
    }

    const handleFormSubmit = (goal: SavingsGoal) => {
        if(selectedGoal) {
            setGoals(goals.map(g => g.id === goal.id ? goal : g));
        } else {
            setGoals([...goals, { ...goal, id: Date.now() }]);
        }
        setIsFormOpen(false);
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-headline font-semibold">Savings Goals</h1>
                    <p className="text-muted-foreground">Create, track, and manage your financial goals.</p>
                </div>
                <Button size="sm" className="gap-1" onClick={handleAdd}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    New Goal
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goals.map(goal => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                        <Card key={goal.id}>
                            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                                <div className="flex-shrink-0">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Target className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="font-headline">{goal.name}</CardTitle>
                                    <CardDescription>Target: ₹{goal.targetAmount.toLocaleString()}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Progress value={progress} />
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-bold text-foreground">₹{goal.currentAmount.toLocaleString()}</span> saved ({progress.toFixed(1)}%)
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                {goal.deadline && (
                                    <p className="text-xs text-muted-foreground">Deadline: {goal.deadline}</p>
                                )}
                                <div className="flex gap-2">
                                     <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>Edit</Button>
                                     <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(goal.id)}>Delete</Button>
                                </div>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
             <GoalForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSubmit={handleFormSubmit}
                goal={selectedGoal}
            />
        </div>
    );
}

