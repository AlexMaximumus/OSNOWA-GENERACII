'use server';

/**
 * @fileOverview Generates a detailed outfit description.
 *
 * - generateOutfitPrompt - A function that handles the outfit description generation.
 * - GenerateOutfitPromptInput - The input type for the generateOutfitPrompt function.
 * - GenerateOutfitPromptOutput - The return type for the generateOutfitPrompt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateOutfitPromptInputSchema = z.object({
  outfitDescription: z.string().describe('A description of the desired outfit style.'),
});
export type GenerateOutfitPromptInput = z.infer<typeof GenerateOutfitPromptInputSchema>;

const GenerateOutfitPromptOutputSchema = z.object({
  name: z.string().describe('A short, descriptive name for the outfit (e.g., "Casual Summer Dress", "Cyberpunk Rebel Gear").'),
  description: z.string().describe('The generated, highly detailed description of the outfit. This description should focus ONLY on the clothing items, their materials, fit, cut, color, layers, accessories, and footwear. It must be at least 300 characters long.'),
});
export type GenerateOutfitPromptOutput = z.infer<typeof GenerateOutfitPromptOutputSchema>;

export async function generateOutfitPrompt(input: GenerateOutfitPromptInput): Promise<GenerateOutfitPromptOutput> {
  return generateOutfitPromptFlow(input);
}

const generateOutfitPromptFlow = ai.defineFlow(
  {
    name: 'generateOutfitPromptFlow',
    inputSchema: GenerateOutfitPromptInputSchema,
    outputSchema: GenerateOutfitPromptOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateOutfitPrompt',
      input: { schema: GenerateOutfitPromptInputSchema },
      output: { schema: GenerateOutfitPromptOutputSchema },
      prompt: `You are a master fashion designer. Your task is to design an outfit based on a general description and create a highly detailed, verbose, and evocative text description of that outfit.

The output must be ONLY a description of the clothing. Do NOT generate a prompt for an image model. Do NOT describe a character wearing the outfit.

Your description must be incredibly specific about every single item of clothing, including materials, texture, fit, cut, color, layers, accessories, and footwear.

You must also generate a short, descriptive name for this outfit.

The final description must be at least 300 characters long.

Desired Outfit Style:
${input.outfitDescription}

Generate the outfit name and the detailed text description of the clothes.
`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);
