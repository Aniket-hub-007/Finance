'use server';
/**
 * @fileOverview This file contains a Genkit flow that suggests the best chart to visualize financial data.
 *
 * It takes financial data as input and returns a recommendation for the most suitable chart type.
 * visualizeSpendingViaCharts - A function that recommends a chart type for visualizing spending data.
 * VisualizeSpendingViaChartsInput - The input type for the visualizeSpendingViaCharts function.
 * VisualizeSpendingViaChartsOutput - The return type for the visualizeSpendingViaCharts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizeSpendingViaChartsInputSchema = z.object({
  financialData: z
    .string()
    .describe('The financial data to visualize, in JSON format.'),
});
export type VisualizeSpendingViaChartsInput = z.infer<
  typeof VisualizeSpendingViaChartsInputSchema
>;

const VisualizeSpendingViaChartsOutputSchema = z.object({
  chartType: z
    .string()
    .describe(
      'The recommended chart type for visualizing the financial data (e.g., bar chart, pie chart, line chart).' + 
      'If financial data contains multiple categories, a bar chart would be the best. ' +
      'If there is a temporal component, a line chart will be the best. ' +
      'If representing the composition of a whole, use pie chart. '
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the chart type recommendation, explaining why it is the most suitable for the given data.'
    ),
});
export type VisualizeSpendingViaChartsOutput = z.infer<
  typeof VisualizeSpendingViaChartsOutputSchema
>;

export async function visualizeSpendingViaCharts(
  input: VisualizeSpendingViaChartsInput
): Promise<VisualizeSpendingViaChartsOutput> {
  return visualizeSpendingViaChartsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'visualizeSpendingViaChartsPrompt',
  input: {schema: VisualizeSpendingViaChartsInputSchema},
  output: {schema: VisualizeSpendingViaChartsOutputSchema},
  prompt: `You are an expert in data visualization. Given the following financial data, recommend the best chart type to use and explain your reasoning. 

Financial Data: {{{financialData}}}

Consider the following chart types: bar chart, pie chart, line chart. Explain which chart is the most suitable and why.
`,
});

const visualizeSpendingViaChartsFlow = ai.defineFlow(
  {
    name: 'visualizeSpendingViaChartsFlow',
    inputSchema: VisualizeSpendingViaChartsInputSchema,
    outputSchema: VisualizeSpendingViaChartsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
