'use server';

import { suggestBudget, SuggestBudgetInput } from '@/ai/flows/suggest-budget-from-financial-data';

export async function getBudgetSuggestion(input: SuggestBudgetInput) {
  try {
    const result = await suggestBudget(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in getBudgetSuggestion:", error);
    return { success: false, error: "Failed to generate budget suggestion. Please try again." };
  }
}
