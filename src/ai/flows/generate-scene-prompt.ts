'use server';

/**
 * @fileOverview Generates an optimized prompt for scene generation based on user inputs.
 *
 * - generateScenePrompt - A function that generates the scene prompt.
 * - GenerateScenePromptInput - The input type for the generateScenePrompt function.
 * - GenerateScenePromptOutput - The return type for the generateScenePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PromptTypeSchema } from '@/lib/types';
import { artisticPromptInstructions } from '@/lib/artistic-prompt-instructions';
import { jsonPromptInstructions } from '@/lib/json-prompt-instructions';

const GenerateScenePromptInputSchema = z.object({
  sceneDescription: z
    .string()
    .describe('Detailed description of the scene including environment, time of day, and mood.'),
  artStyle: z
    .string()
    .optional()
    .describe('Preferred art style for the scene (e.g., photorealistic, painting, cartoon).'),
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
export type GenerateScenePromptInput = z.infer<typeof GenerateScenePromptInputSchema>;

const GenerateScenePromptOutputSchema = z.object({
  prompt: z.string().describe('The generated prompt for creating the scene image.'),
});
export type GenerateScenePromptOutput = z.infer<typeof GenerateScenePromptOutputSchema>;

export async function generateScenePrompt(input: GenerateScenePromptInput): Promise<GenerateScenePromptOutput> {
  return generateScenePromptFlow(input);
}

const generateScenePromptFlow = ai.defineFlow(
  {
    name: 'generateScenePromptFlow',
    inputSchema: GenerateScenePromptInputSchema,
    outputSchema: GenerateScenePromptOutputSchema,
  },
  async (input) => {
    
    let basePrompt = `You are an expert prompt engineer specializing in creating detailed and optimized prompts for generating scene images based on user inputs.

If the user has provided specific parameters (style, camera, etc.), use them. If not, choose suitable options yourself based on the general description.
`;
  
    if (input.promptType === 'artistic') {
      basePrompt += `
You must generate an artistic prompt. The prompt should be very descriptive and include details about the environment, characters (if any), objects, atmosphere, and overall composition to guide the AI model in creating the desired scene.
${artisticPromptInstructions}`;
    } else {
      basePrompt += `
You must generate a JSON prompt. Fill in the JSON structure based on the description.
${jsonPromptInstructions}`;
    }

    const finalPrompt = `${basePrompt}

Scene Description: ${input.sceneDescription}
${input.artStyle ? `Art Style: ${input.artStyle}` : ''}
${input.cameraAngle ? `Camera Angle: ${input.cameraAngle}` : ''}
${input.lightingStyle ? `Lighting Style: ${input.lightingStyle}` : ''}
${input.camera ? `Camera: ${input.camera}` : ''}
${input.filmType ? `Film Type: ${input.filmType}` : ''}
`;

    const prompt = ai.definePrompt({
        name: 'generateScenePrompt',
        input: {schema: GenerateScenePromptInputSchema},
        output: {schema: GenerateScenePromptOutputSchema},
        prompt: finalPrompt,
    });
    
    const {output} = await prompt(input);
    return output!;
  }
);
