'use server';

/**
 * @fileOverview Generates a location prompt based on user input.
 *
 * - generateLocationPrompt - A function that generates the location prompt.
 * - GenerateLocationPromptInput - The input type for the generateLocationPrompt function.
 * - GenerateLocationPromptOutput - The return type for the generateLocationPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PromptTypeSchema } from '@/lib/types';
import { artisticPromptInstructions } from '@/lib/artistic-prompt-instructions';
import { jsonPromptInstructions } from '@/lib/json-prompt-instructions';

const GenerateLocationPromptInputSchema = z.object({
  description: z.string().describe('A general description of the location.'),
  artStyle: z
    .string()
    .optional()
    .describe('Preferred art style for the location (e.g., photorealistic, painting, cartoon).'),
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
});
export type GenerateLocationPromptInput = z.infer<typeof GenerateLocationPromptInputSchema>;

const GenerateLocationPromptOutputSchema = z.object({
  name: z.string().describe('A short, descriptive name for the location (e.g., "Misty Forest Glade", "Cyberpunk Megacity Alley").'),
  prompt: z.string().describe('The generated, highly detailed prompt for creating the location image. It must be at least 3000 characters long.'),
});
export type GenerateLocationPromptOutput = z.infer<typeof GenerateLocationPromptOutputSchema>;

export async function generateLocationPrompt(input: GenerateLocationPromptInput): Promise<GenerateLocationPromptOutput> {
  return generateLocationPromptFlow(input);
}

const generateLocationPromptFlow = ai.defineFlow(
  {
    name: 'generateLocationPromptFlow',
    inputSchema: GenerateLocationPromptInputSchema,
    outputSchema: GenerateLocationPromptOutputSchema,
  },
  async (input) => {
    
    let basePrompt = `You are an expert prompt engineer specializing in creating extremely detailed and evocative location/environment prompts.

Your task is to take a general description of a location and expand it into a rich, verbose, and specific prompt for an image generation model. The prompt must be at least 3000 characters long.

CRITICAL RULE: Do NOT include any characters, people, or living beings in the prompt. The focus is exclusively on the environment, atmosphere, and objects within it.

Generate a short, descriptive name for the location, and the detailed image prompt.
`;

    if (input.promptType === 'artistic') {
        basePrompt += `You must generate an artistic prompt. ${artisticPromptInstructions}`;
    } else {
        basePrompt += `You must generate a JSON prompt. ${jsonPromptInstructions}`;
    }

    if (input.promptType === 'artistic') {
         basePrompt += `
If the user has provided specific parameters (style, camera, etc.), use them. If not, choose suitable options yourself based on the general description.`;
    }

    const finalPrompt = `${basePrompt}
  
Location Description: ${input.description}
${input.artStyle && input.artStyle !== 'none' ? `Art Style: ${input.artStyle}` : ''}
${input.cameraAngle && input.cameraAngle !== 'none' ? `Camera Angle: ${input.cameraAngle}` : ''}
${input.lightingStyle && input.lightingStyle !== 'none' ? `Lighting Style: ${input.lightingStyle}` : ''}
${input.camera && input.camera !== 'none' ? `Camera: ${input.camera}` : ''}
${input.filmType && input.filmType !== 'none' ? `Film Type: ${input.filmType}` : ''}
`;

    const prompt = ai.definePrompt({
        name: 'generateLocationPrompt',
        input: {schema: GenerateLocationPromptInputSchema},
        output: {schema: GenerateLocationPromptOutputSchema},
        prompt: finalPrompt
    });
    const {output} = await prompt(input);
    return output!;
  }
);
