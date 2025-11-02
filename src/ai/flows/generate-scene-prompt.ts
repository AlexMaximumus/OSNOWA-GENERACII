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

const GenerateScenePromptInputSchema = z.object({
  sceneDescription: z
    .string()
    .describe('Detailed description of the scene including environment, time of day, and mood.'),
  artStyle: z
    .string()
    .describe('Preferred art style for the scene (e.g., photorealistic, painting, cartoon).'),
  cameraAngle: z
    .string()
    .describe('Desired camera angle or perspective (e.g., wide shot, close-up, aerial view).'),
  lightingStyle: z
    .string()
    .describe('Type of lighting for the scene (e.g., soft, dramatic, natural).'),
});
export type GenerateScenePromptInput = z.infer<typeof GenerateScenePromptInputSchema>;

const GenerateScenePromptOutputSchema = z.object({
  prompt: z.string().describe('The generated prompt for creating the scene image.'),
});
export type GenerateScenePromptOutput = z.infer<typeof GenerateScenePromptOutputSchema>;

export async function generateScenePrompt(input: GenerateScenePromptInput): Promise<GenerateScenePromptOutput> {
  return generateScenePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateScenePrompt',
  input: {schema: GenerateScenePromptInputSchema},
  output: {schema: GenerateScenePromptOutputSchema},
  prompt: `You are an expert prompt engineer specializing in creating detailed and optimized prompts for generating scene images based on user inputs.

  Based on the following scene details, generate a comprehensive prompt that can be used with AI image generation models like DALL-E, Midjourney, or Stable Diffusion to create a visually compelling scene.

  Scene Description: {{{sceneDescription}}}
  Art Style: {{{artStyle}}}
  Camera Angle: {{{cameraAngle}}}
  Lighting Style: {{{lightingStyle}}}

  The generated prompt should be highly descriptive and include details about the environment, characters (if any), objects, atmosphere, and overall composition to guide the AI model in creating the desired scene.
  `,
});

const generateScenePromptFlow = ai.defineFlow(
  {
    name: 'generateScenePromptFlow',
    inputSchema: GenerateScenePromptInputSchema,
    outputSchema: GenerateScenePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
