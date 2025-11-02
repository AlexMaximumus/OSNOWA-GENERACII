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

const GenerateCharacterPromptInputSchema = z.object({
  genre: z.string().describe('The genre of the story, e.g., fantasy, sci-fi, historical.'),
  name: z.string().describe('The name of the character.'),
  age: z.number().describe('The age of the character.'),
  occupation: z.string().describe('The occupation of the character.'),
  personality: z.string().describe('The personality of the character.'),
  appearance: z.string().describe('The appearance of the character.'),
  motivations: z.string().describe('The motivations of the character.'),
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
  prompt: `You are a prompt engineer specializing in creating detailed character design prompts.

  Based on the provided character details, generate a prompt that can be used to create an image of the character.
  The prompt should include details about the character's appearance, clothing, and environment, fitting for the character's genre, occupation and motivations.

  Genre: {{{genre}}}
  Name: {{{name}}}
  Age: {{{age}}}
  Occupation: {{{occupation}}}
  Personality: {{{personality}}}
  Appearance: {{{appearance}}}
  Motivations: {{{motivations}}}

  Generated Prompt:`, // Ensure this is closed correctly
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
