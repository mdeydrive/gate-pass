'use server';
/**
 * @fileOverview AI flow for detecting suspicious activity based on entry and exit patterns.
 *
 * - analyzeActivity - Analyzes entry/exit data and flags anomalies.
 * - AnalyzeActivityInput - Input type for the analyzeActivity function.
 * - AnalyzeActivityOutput - Return type for the analyzeActivity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeActivityInputSchema = z.object({
  entryTime: z.string().describe('Entry timestamp in ISO format.'),
  exitTime: z.string().describe('Exit timestamp in ISO format.'),
  personnelType: z
    .enum(['visitor', 'delivery', 'staff', 'vehicle'])
    .describe('Type of personnel entering/exiting.'),
  personnelId: z.string().describe('ID of the person or vehicle.'),
  isBlacklisted: z.boolean().describe('Whether the personnel is blacklisted.'),
  expectedVisitDuration: z
    .string()
    .optional()
    .describe('Expected duration of the visit in ISO format.'),
});
export type AnalyzeActivityInput = z.infer<typeof AnalyzeActivityInputSchema>;

const AnalyzeActivityOutputSchema = z.object({
  isSuspicious: z.boolean().describe('Whether the activity is suspicious.'),
  reason: z
    .string()
    .optional()
    .describe('Reason for considering the activity suspicious.'),
});
export type AnalyzeActivityOutput = z.infer<typeof AnalyzeActivityOutputSchema>;

export async function analyzeActivity(
  input: AnalyzeActivityInput
): Promise<AnalyzeActivityOutput> {
  return analyzeActivityFlow(input);
}

const analyzeActivityPrompt = ai.definePrompt({
  name: 'analyzeActivityPrompt',
  input: {schema: AnalyzeActivityInputSchema},
  output: {schema: AnalyzeActivityOutputSchema},
  prompt: `You are an AI security analyst specializing in detecting suspicious activities in a multi-complex building. Analyze the provided entry and exit data to determine if the activity is suspicious. Consider factors such as access times, personnel type, blacklist status, and expected visit duration.

Entry Time: {{{entryTime}}}
Exit Time: {{{exitTime}}}
Personnel Type: {{{personnelType}}}
Personnel ID: {{{personnelId}}}
Blacklisted: {{{isBlacklisted}}}
Expected Visit Duration: {{{expectedVisitDuration}}}

Determine if the activity is suspicious and provide a reason if it is. Return the response in JSON format.
`,
});

const analyzeActivityFlow = ai.defineFlow(
  {
    name: 'analyzeActivityFlow',
    inputSchema: AnalyzeActivityInputSchema,
    outputSchema: AnalyzeActivityOutputSchema,
  },
  async input => {
    const {output} = await analyzeActivityPrompt(input);
    return output!;
  }
);
