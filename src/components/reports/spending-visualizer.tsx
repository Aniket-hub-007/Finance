'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getChartSuggestion } from '@/app/reports/actions';
import type { VisualizeSpendingViaChartsOutput } from '@/ai/flows/visualize-spending-via-charts';
import { Loader2, BarChart, PieChart, LineChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, Pie, Cell, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { toast } from '@/hooks/use-toast';

const sampleData = [
    { month: "January", groceries: 400, transport: 150, entertainment: 200, rent: 1200 },
    { month: "February", groceries: 380, transport: 140, entertainment: 220, rent: 1200 },
    { month: "March", groceries: 410, transport: 160, entertainment: 180, rent: 1200 },
    { month: "April", groceries: 420, transport: 155, entertainment: 210, rent: 1200 },
    { month: "May", groceries: 390, transport: 145, entertainment: 250, rent: 1200 },
];

const chartConfig = {
    groceries: { label: 'Groceries', color: 'hsl(var(--chart-1))' },
    transport: { label: 'Transport', color: 'hsl(var(--chart-2))' },
    entertainment: { label: 'Entertainment', color: 'hsl(var(--chart-3))' },
    rent: { label: 'Rent', color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig;

export function SpendingVisualizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<VisualizeSpendingViaChartsOutput | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setSuggestion(null);

    const result = await getChartSuggestion(JSON.stringify(sampleData));
    
    if (result.success && result.data) {
        setSuggestion(result.data);
        // Prepare data for charts
        if (result.data.chartType.toLowerCase().includes('pie')) {
            const totals = sampleData.reduce((acc, month) => {
                Object.keys(month).forEach(key => {
                    if (key !== 'month') {
                        acc[key] = (acc[key] || 0) + month[key];
                    }
                });
                return acc;
            }, {} as Record<string, number>);
            setChartData(Object.entries(totals).map(([name, value]) => ({ name, value })));
        } else {
             setChartData(sampleData);
        }
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsLoading(false);
  };

  const renderChart = () => {
    if (!suggestion) return null;

    const chartType = suggestion.chartType.toLowerCase();

    if (chartType.includes('bar')) {
      return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="groceries" fill="var(--color-groceries)" radius={4} />
              <Bar dataKey="transport" fill="var(--color-transport)" radius={4} />
              <Bar dataKey="entertainment" fill="var(--color-entertainment)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      );
    }

    if (chartType.includes('pie')) {
      return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Tooltip content={<ChartTooltipContent nameKey="value" />} />
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120}>
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={chartConfig[entry.name as keyof typeof chartConfig]?.color || '#8884d8'} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
      );
    }
    
    if (chartType.includes('line')) {
      return (
         <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="groceries" stroke="var(--color-groceries)" />
              <Line type="monotone" dataKey="transport" stroke="var(--color-transport)" />
              <Line type="monotone" dataKey="entertainment" stroke="var(--color-entertainment)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      );
    }
    return <p>Unsupported chart type: {suggestion.chartType}</p>;
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-start'>
            <div>
                <CardTitle className="font-headline">Analysis</CardTitle>
                <CardDescription>Using sample spending data over 5 months.</CardDescription>
            </div>
            <Button onClick={handleAnalyze} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart className="mr-2 h-4 w-4" />}
                Analyze Spending
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )}
        {suggestion && (
            <div className="grid gap-6">
                <div className='p-4 bg-muted/50 rounded-lg'>
                    <h3 className="font-semibold">AI Recommendation: <span className='text-primary'>{suggestion.chartType}</span></h3>
                    <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                </div>
                <div>{renderChart()}</div>
            </div>
        )}
         {!isLoading && !suggestion && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Click "Analyze Spending" to see the AI visualization.</p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
