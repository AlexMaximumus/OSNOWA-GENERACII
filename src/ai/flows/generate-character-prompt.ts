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
import { PromptTypeSchema, CreationTypeSchema } from '@/lib/types';
import { artisticPromptInstructions } from '@/lib/artistic-prompt-instructions';
import { jsonPromptInstructions } from '@/lib/json-prompt-instructions';
import { studioPromptInstructions } from '@/lib/studio-prompt-instructions';

const GenerateCharacterPromptInputSchema = z.object({
  description: z.string().describe('A general description of the character.'),
  artStyle: z
    .string()
    .optional()
    .describe('Preferred art style for the character (e.g., photorealistic, painting, cartoon).'),
  cameraAngle: z
    .string()
    .optional()
    .describe('Desired camera angle or perspective (e.g., wide shot, close-up, aerial view).'),
  lightingStyle: z
    .string()
    .optional()
    .describe('Type of lighting for the scene (e.g., soft, dramatic, natural).'),
  camera: z.string().optional().describe('The camera used for the shot.'),
  filmType: z.string().optional().describe('The type of film used.'),
  promptType: PromptTypeSchema,
  creationType: CreationTypeSchema,
});
export type GenerateCharacterPromptInput = z.infer<typeof GenerateCharacterPromptInputSchema>;

const GenerateCharacterPromptOutputSchema = z.object({
  name: z.string().describe('The name of the character, extracted from the description.'),
  appearanceDescription: z.string().describe('A detailed physical description of the character from head to toe.'),
  prompt: z.string().describe('The generated prompt for character creation.'),
});
export type GenerateCharacterPromptOutput = z.infer<typeof GenerateCharacterPromptOutputSchema>;

export async function generateCharacterPrompt(input: GenerateCharacterPromptInput): Promise<GenerateCharacterPromptOutput> {
  return generateCharacterPromptFlow(input);
}

const generateCharacterPromptFlow = ai.defineFlow(
  {
    name: 'generateCharacterPromptFlow',
    inputSchema: GenerateCharacterPromptInputSchema,
    outputSchema: GenerateCharacterPromptOutputSchema,
  },
  async (input) => {
    
    let basePrompt = `You are a prompt engineer specializing in creating detailed character design prompts.

Analyze the following character description. Extract the character's name and generate:
1. A detailed prompt for creating an image of this character.
2. A separate, detailed physical description of the character from head to toe.

If a name is not explicitly provided, invent one.
`;

    if (input.creationType === 'studio') {
        basePrompt += studioPromptInstructions;
    } else {
        if (input.promptType === 'artistic') {
            basePrompt += artisticPromptInstructions;
        } else {
            basePrompt += jsonPromptInstructions;
        }

        if (input.promptType === 'artistic') {
             basePrompt += `
If the user has provided specific parameters (style, camera, etc.), use them. If not, choose suitable options yourself based on the general description.`;
        }
    }


    const finalPrompt = `${basePrompt}
  
Character Description: ${input.description}
${input.artStyle ? `Art Style: ${input.artStyle}` : ''}
${input.cameraAngle ? `Camera Angle: ${input.cameraAngle}` : ''}
${input.lightingStyle ? `Lighting Style: ${input.lightingStyle}` : ''}
${input.camera ? `Camera: ${input.camera}` : ''}
${input.filmType ? `Film Type: ${input.filmType}` : ''}
`;

    const prompt = ai.definePrompt({
        name: 'generateCharacterPromptPrompt',
        input: {schema: GenerateCharacterPromptInputSchema},
        output: {schema: GenerateCharacterPromptOutputSchema},
        prompt: finalPrompt
    });
    const {output} = await prompt(input);
    return output!;
  }
);
