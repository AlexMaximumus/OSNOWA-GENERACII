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
  prompt: `Вы — AI-инженер по промптам, специализирующийся на дизайне персонажей.

  Проанализируйте следующие успешные и неуспешные промпты для персонажей и дайте предложения по улучшению будущих промптов для персонажей.

  Успешные промпты:
  {{#each successfulPrompts}}
  - {{{this}}}
  {{/each}}

  Неуспешные промпты:
  {{#each unsuccessfulPrompts}}
  - {{{this}}}
  {{/each}}

  Предоставьте конкретные и действенные предложения по улучшению будущих промптов для персонажей на основе закономерностей, которые вы выявите в успешных и неуспешных промптах.
  Учитывайте такие аспекты, как ясность, детализация и использование конкретных ключевых слов или фраз.
  Верните предложения в виде нумерованного списка.
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
