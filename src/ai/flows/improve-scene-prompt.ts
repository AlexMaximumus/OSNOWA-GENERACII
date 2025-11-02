'use server';

/**
 * @fileOverview Flow to analyze previous scene prompts and suggest improvements.
 *
 * - improveScenePrompt - A function that analyzes scene prompts and suggests improvements.
 * - ImproveScenePromptInput - The input type for the improveScenePrompt function.
 * - ImproveScenePromptOutput - The return type for the improveScenePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveScenePromptInputSchema = z.object({
  successfulPrompts: z.array(
    z.string().describe('A list of successful scene prompts.')
  ),
  unsuccessfulPrompts: z.array(
    z.string().describe('A list of unsuccessful scene prompts.')
  ),
});

export type ImproveScenePromptInput = z.infer<typeof ImproveScenePromptInputSchema>;

const ImproveScenePromptOutputSchema = z.object({
  suggestedImprovements: z
    .string()
    .describe('Suggested improvements for future scene prompts.'),
});

export type ImproveScenePromptOutput = z.infer<typeof ImproveScenePromptOutputSchema>;

export async function improveScenePrompt(
  input: ImproveScenePromptInput
): Promise<ImproveScenePromptOutput> {
  return improveScenePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveScenePromptPrompt',
  input: {schema: ImproveScenePromptInputSchema},
  output: {schema: ImproveScenePromptOutputSchema},
  prompt: `You are an AI prompt improvement assistant. Analyze the following successful and unsuccessful scene prompts and provide suggestions for improving future scene prompts.

Successful Prompts:
{{#each successfulPrompts}}
- {{{this}}}
{{/each}}

Unsuccessful Prompts:
{{#each unsuccessfulPrompts}}
- {{{this}}}
{{/each}}

Provide specific and actionable suggestions for improving future scene prompts based on the patterns you observe in the successful and unsuccessful prompts.
`,
});

const improveScenePromptFlow = ai.defineFlow(
  {
    name: 'improveScenePromptFlow',
    inputSchema: ImproveScenePromptInputSchema,
    outputSchema: ImproveScenePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
