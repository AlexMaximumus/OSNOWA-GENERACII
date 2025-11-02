'use server';

/**
 * @fileOverview Generates a character creation prompt based on user input.
 *
 * - generateCharacterPrompt - A function that generates the character prompt.
 * - GenerateCharacterPromptInput - The input type for the generateCharacterPrompt function.
 * - GenerateCharacterPromptOutput - The return type for the generateCharacterPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PromptTypeSchema } from '@/lib/types';
import { artisticPromptInstructions } from '@/lib/artistic-prompt-instructions';
import { jsonPromptInstructions } from '@/lib/json-prompt-instructions';

const GenerateCharacterPromptInputSchema = z.object({
  genre: z.string().describe('The genre of the story, e.g., fantasy, sci-fi, historical.'),
  name: z.string().describe('The name of the character.'),
  age: z.number().describe('The age of the character.'),
  occupation: z.string().describe('The occupation of the character.'),
  personality: z.string().describe('The personality of the character.'),
  appearance: z.string().describe('The appearance of the character.'),
  motivations: z.string().describe('The motivations of the character.'),
  promptType: PromptTypeSchema,
});
export type GenerateCharacterPromptInput = z.infer<typeof GenerateCharacterPromptInputSchema>;

const GenerateCharacterPromptOutputSchema = z.object({
  prompt: z.string().describe('The generated prompt for character creation.'),
});
export type GenerateCharacterPromptOutput = z.infer<typeof GenerateCharacterPromptOutputSchema>;

export async function generateCharacterPrompt(input: GenerateCharacterPromptInput): Promise<GenerateCharacterPromptOutput> {
  return generateCharacterPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCharacterPromptPrompt',
  input: {schema: GenerateCharacterPromptInputSchema},
  output: {schema: GenerateCharacterPromptOutputSchema},
  prompt: `Вы — инженер по промптам, специализирующийся на создании подробных промптов для дизайна персонажей.

  {{#ifCond promptType "==" "artistic"}}
  ${artisticPromptInstructions}
  {{/ifCond}}
  {{#ifCond promptType "==" "json"}}
  ${jsonPromptInstructions}
  {{/ifCond}}

  На основе предоставленных данных о персонаже, сгенерируйте промпт, который можно использовать для создания изображения персонажа.
  Промпт должен включать детали о внешности, одежде и окружении персонажа, соответствующие его жанру, профессии и мотивации.

  Жанр: {{{genre}}}
  Имя: {{{name}}}
  Возраст: {{{age}}}
  Профессия: {{{occupation}}}
  Характер: {{{personality}}}
  Внешность: {{{appearance}}}
  Мотивация: {{{motivations}}}

  Сгенерированный промпт:`,
});

const generateCharacterPromptFlow = ai.defineFlow(
  {
    name: 'generateCharacterPromptFlow',
    inputSchema: GenerateCharacterPromptInputSchema,
    outputSchema: GenerateCharacterPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
