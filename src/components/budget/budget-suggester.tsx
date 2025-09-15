'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getBudgetSuggestion } from '@/app/budget/actions';
import { FormSchema } from '@/app/budget/types';
import type { SuggestBudgetOutput } from '@/ai/flows/suggest-budget-from-financial-data';
import { Loader2, PlusCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';

export function BudgetSuggester() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestBudgetOutput | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      income: 1000,
      expenses: [{ category: 'Rent', amount: 500 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'expenses',
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setSuggestion(null);

    const result = await getBudgetSuggestion(values);

    if (result.success && result.data) {
      setSuggestion(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }

    setIsLoading(false);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Financials</CardTitle>
          <CardDescription>Enter your monthly income and expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Monthly Income</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="3000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label className="mb-4 block">Monthly Expenses</Label>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`expenses.${index}.category`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Category (e.g., Rent)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`expenses.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="number" placeholder="Amount" {...field} />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => append({ category: '', amount: 0 })}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Expense
                  </Button>
                </div>
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Budget
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI Budget Suggestion</CardTitle>
          <CardDescription>Here is a personalized budget plan for you.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {suggestion && (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Budget Breakdown</h3>
                    <ul className="space-y-2">
                        {Object.entries(suggestion.suggestedBudget).map(([key, value]) => (
                            <li key={key} className="flex justify-between items-center text-sm">
                                <span className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="font-medium">${value.toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <Separator />
                <div>
                    <h3 className="text-lg font-semibold mb-2">Summary & Advice</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{suggestion.summary}</p>
                </div>
            </div>
          )}
          {!isLoading && !suggestion && (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Your budget suggestion will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
