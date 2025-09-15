import { SpendingVisualizer } from "@/components/reports/spending-visualizer";

export default function ReportsPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-headline font-semibold">Spending Visualizer</h1>
                <p className="text-muted-foreground">Visualize your spending with the perfect chart, chosen by AI.</p>
            </div>
            <SpendingVisualizer />
        </div>
    );
}