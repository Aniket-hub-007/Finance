'use server';

import { suggestBudget, SuggestBudgetInput } from '@/ai/flows/suggest-budget-from-financial-data';
import { z } from 'zod';

const expenseSchema = z.object({
    category: z.string().min(1, 'Category is required'),
    amount: z.coerce.number().min(0, 'Amount must be positive'),
});
  
export const FormSchema = z.object({
    income: z.coerce.number().min(1, 'Income is required'),
    expenses: z.array(expenseSchema).min(1, 'At least one expense is required'),
});

export async function getBudgetSuggestion(input: SuggestBudgetInput) {
  try {
    const result = await suggestBudget(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in getBudgetSuggestion:", error);
    return { success: false, error: "Failed to generate budget suggestion. Please try again." };
  }
}
