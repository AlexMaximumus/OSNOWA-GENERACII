'use server';

/**
 * @fileOverview Generates an optimized prompt for scene generation based on user inputs.
 *
 * - generateScenePrompt - A function that generates the scene prompt.
 * - GenerateScenePromptInput - The input type for the generateScenePrompt function
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
  characterInfo: z.string().optional().describe("A string containing the full, consistent, and detailed visual appearance description and prompt for a character. This MUST NOT contain a name."),
  referenceImage: z.string().optional().describe("A data URI of a reference image. Analyze this image and use it as the primary visual guide for the scene's composition, style, and mood, but replace elements as described in the text prompt."),
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
  prompt: z.string().describe('The generated prompt for creating the scene image. The prompt must be at least 3000 characters long.'),
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
    
    let basePrompt = `You are an expert prompt engineer specializing in creating detailed and optimized prompts for generating scene images based on user inputs. The final prompt must be at least 3000 characters long.

CRITICAL RULE FOR REFERENCE IMAGE: If a reference image ('referenceImage') is provided, you MUST treat it as a blueprint. Your task is to EXACTLY replicate the composition, camera angle, character pose, and overall structure of the reference image. However, you must intelligently REPLACE the subject (character), location, and atmosphere with the NEW details provided in the text inputs ('characterInfo', 'sceneDescription', etc.). Your final prompt should describe a scene that has the same visual structure as the reference image but with the content specified in the text.

If a character description ('characterInfo') is provided, you MUST seamlessly integrate it into the main scene description. This 'characterInfo' contains a pre-made, detailed visual description and should be used as-is to ensure consistency. The character should be the central focus of the scene. Do NOT use a character name, only the visual description provided.

If the description includes a base location prompt and additional details, you must synthesize them. Use the base location prompt as the foundation and expertly weave the additional scene details into it to create a single, cohesive, and extremely detailed final prompt.

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

    const fullSceneDescription = input.characterInfo 
      ? `Visual Character Description to include in scene: ${input.characterInfo}\n\nScene Description: ${input.sceneDescription}`
      : `Scene Description: ${input.sceneDescription}`;

    const finalPrompt = `${basePrompt}

${fullSceneDescription}
${input.artStyle && input.artStyle !== 'none' ? `Art Style: ${input.artStyle}` : ''}
${input.cameraAngle && input.cameraAngle !== 'none' ? `Camera Angle: ${input.cameraAngle}` : ''}
${input.lightingStyle && input.lightingStyle !== 'none' ? `Lighting Style: ${input.lightingStyle}` : ''}
${input.camera && input.camera !== 'none' ? `Camera: ${input.camera}` : ''}
${input.filmType && input.filmType !== 'none' ? `Film Type: ${input.filmType}` : ''}
`;

    const model = input.referenceImage ? 'gemini-2.5-flash-image-preview' : 'gemini-2.5-flash';

    const prompt = ai.definePrompt({
        name: 'generateScenePrompt',
        input: {schema: GenerateScenePromptInputSchema},
        output: {schema: GenerateScenePromptOutputSchema},
        prompt: finalPrompt,
        config: {
            model: `googleai/${model}`
        }
    });
    
    const {output} = await prompt(input.referenceImage ? {
        ...input,
        prompt: [
            { media: { url: input.referenceImage } },
            { text: finalPrompt }
        ]
    } as any : input);

    return output!;
  }
);
