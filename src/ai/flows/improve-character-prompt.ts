'use server';

/**
 * @fileOverview Flow to analyze previous character prompts and suggest improvements for future character prompt generation.
 *
 * - improveCharacterPrompt - A function that handles the prompt improvement process.
 * - ImproveCharacterPromptInput - The input type for the improveCharacterPrompt function.
 * - ImproveCharacterPromptOutput - The return type for the improveCharacterPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveCharacterPromptInputSchema = z.object({
  successfulPrompts: z
    .array(z.string())
    .describe('An array of previous successful character prompts.'),
  unsuccessfulPrompts: z
    .array(z.string())
    .describe('An array of previous unsuccessful character prompts.'),
});
export type ImproveCharacterPromptInput = z.infer<
  typeof ImproveCharacterPromptInputSchema
>;

const ImproveCharacterPromptOutputSchema = z.object({
  improvedPromptSuggestions: z
    .array(z.string())
    .describe('Suggestions for improving character prompts.'),
});
export type ImproveCharacterPromptOutput = z.infer<
  typeof ImproveCharacterPromptOutputSchema
>;

export async function improveCharacterPrompt(
  input: ImproveCharacterPromptInput
): Promise<ImproveCharacterPromptOutput> {
  return improveCharacterPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveCharacterPromptPrompt',
  input: {schema: ImproveCharacterPromptInputSchema},
  output: {schema: ImproveCharacterPromptOutputSchema},
  prompt: `You are an AI prompt engineer specializing in character design.

  Analyze the following successful and unsuccessful character prompts and provide suggestions for improving future character prompts.

  Successful Prompts:
  {{#each successfulPrompts}}
  - {{{this}}}
  {{/each}}

  Unsuccessful Prompts:
  {{#each unsuccessfulPrompts}}
  - {{{this}}}
  {{/each}}

  Provide specific and actionable suggestions for improving future character prompts based on the patterns you identify in the successful and unsuccessful prompts.
  Consider aspects such as clarity, detail, and the use of specific keywords or phrases.
  Return the suggestions in a numbered list.
  `,
});

const improveCharacterPromptFlow = ai.defineFlow(
  {
    name: 'improveCharacterPromptFlow',
    inputSchema: ImproveCharacterPromptInputSchema,
    outputSchema: ImproveCharacterPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
