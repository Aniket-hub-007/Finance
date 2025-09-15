'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting a budget based on user's financial data.
 *
 * - suggestBudget - A function that takes income and expense data and returns a suggested budget.
 * - SuggestBudgetInput - The input type for the suggestBudget function.
 * - SuggestBudgetOutput - The return type for the suggestBudget function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBudgetInputSchema = z.object({
  income: z
    .number()
    .describe('The total monthly income of the user.'),
  expenses: z
    .array(z.object({
      category: z.string().describe('The category of the expense.'),
      amount: z.number().describe('The amount spent in that category.'),
    }))
    .describe('An array of expenses with category and amount.'),
});
export type SuggestBudgetInput = z.infer<typeof SuggestBudgetInputSchema>;

const SuggestBudgetOutputSchema = z.object({
  suggestedBudget: z.object({
    housing: z.number().describe('Suggested budget for housing.'),
    food: z.number().describe('Suggested budget for food.'),
    transportation: z.number().describe('Suggested budget for transportation.'),
    utilities: z.number().describe('Suggested budget for utilities.'),
    savings: z.number().describe('Suggested amount for savings.'),
    debtRepayment: z.number().describe('Suggested amount for debt repayment.'),
    other: z.number().describe('Suggested budget for other expenses.'),
  }).describe('A detailed suggested budget.'),
  summary: z.string().describe('A summary of the suggested budget and advice.'),
});
export type SuggestBudgetOutput = z.infer<typeof SuggestBudgetOutputSchema>;

export async function suggestBudget(input: SuggestBudgetInput): Promise<SuggestBudgetOutput> {
  return suggestBudgetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBudgetPrompt',
  input: {schema: SuggestBudgetInputSchema},
  output: {schema: SuggestBudgetOutputSchema},
  prompt: `You are a personal finance advisor. Based on the user's income and expenses, you will suggest a realistic monthly budget.

  Income: ${'{{income}}'}

  Expenses:
  {{#each expenses}}
  - Category: ${'{{this.category}}'}, Amount: ${'{{this.amount}}'}
  {{/each}}

  Consider the 50/30/20 rule (50% for needs, 30% for wants, 20% for savings and debt repayment) as a guideline, but adjust based on the provided expenses.

  Provide a detailed budget, including amounts for housing, food, transportation, utilities, savings, debt repayment, and other expenses. Also provide a summary of your suggestions and any relevant advice.

  Format your response as a JSON object matching the following schema:
  ${JSON.stringify(SuggestBudgetOutputSchema.describe, null, 2)}`,
});

const suggestBudgetFlow = ai.defineFlow(
  {
    name: 'suggestBudgetFlow',
    inputSchema: SuggestBudgetInputSchema,
    outputSchema: SuggestBudgetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
