'use server';

import { visualizeSpendingViaCharts } from '@/ai/flows/visualize-spending-via-charts';

export async function getChartSuggestion(financialData: string) {
  try {
    const result = await visualizeSpendingViaCharts({ financialData });
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting chart suggestion:', error);
    return { success: false, error: 'Failed to generate chart suggestion.' };
  }
}
