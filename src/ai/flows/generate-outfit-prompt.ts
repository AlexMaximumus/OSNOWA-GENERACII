'use server';

/**
 * @fileOverview Generates a detailed outfit prompt for a character.
 *
 * - generateOutfitPrompt - A function that handles the outfit prompt generation.
 * - GenerateOutfitPromptInput - The input type for the generateOutfitPrompt function.
 * - GenerateOutfitPromptOutput - The return type for the generateOutfitPrompt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateOutfitPromptInputSchema = z.object({
  characterAppearance: z.string().describe('The detailed physical appearance of the character.'),
  outfitDescription: z.string().describe('A description of the desired outfit style.'),
  artStyle: z.string().optional().describe('The art style for the image.'),
});
export type GenerateOutfitPromptInput = z.infer<typeof GenerateOutfitPromptInputSchema>;

const GenerateOutfitPromptOutputSchema = z.object({
  name: z.string().describe('A short, descriptive name for the outfit (e.g., "Casual Summer Dress", "Cyberpunk Rebel Gear").'),
  prompt: z.string().describe('The generated, highly detailed prompt for the character wearing the specified outfit. This prompt should focus on the clothing items, their materials, fit, and how they interact with the character\'s body and posture. It must be at least 2000 characters long.'),
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
      prompt: `You are a master fashion designer and prompt engineer. Your task is to design an outfit based on a general description and create a highly detailed, verbose, and evocative prompt for an image generation model.

The prompt must describe a character wearing this outfit. It should be incredibly specific about every single item of clothing, including materials, texture, fit, cut, color, layers, accessories, and footwear. Describe how the clothing hangs on the character's body, how it wrinkles, and how it interacts with their posture.

You must also generate a short, descriptive name for this outfit.

The final image prompt must be at least 2000 characters long.

Character's Appearance:
${input.characterAppearance}

Desired Outfit Style:
${input.outfitDescription}

Art Style:
${input.artStyle || 'Photorealistic, cinematic lighting'}

Generate the outfit name and the detailed prompt.
`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);
