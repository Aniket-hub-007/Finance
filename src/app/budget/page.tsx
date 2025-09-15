import { BudgetSuggester } from "@/components/budget/budget-suggester";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default function BudgetPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-headline font-semibold">AI Budget Planner</h1>
                <p className="text-muted-foreground">Let our AI create a realistic budget based on your finances.</p>
            </div>
            <BudgetSuggester />
        </div>
    );
}