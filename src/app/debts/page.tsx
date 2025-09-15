import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { debts } from "@/lib/data";
import { CreditCard, PlusCircle } from "lucide-react";

export default function DebtsPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-headline font-semibold">Debt Management</h1>
                    <p className="text-muted-foreground">Add debts and track your payoff progress.</p>
                </div>
                 <Button size="sm" className="gap-1">
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
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
