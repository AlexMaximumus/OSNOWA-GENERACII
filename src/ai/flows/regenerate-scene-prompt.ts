
'use server';

/**
 * @fileOverview Regenerates a scene prompt with updated parameters.
 *
 * - regenerateScenePrompt - A function that regenerates the scene prompt.
 * - RegenerateScenePromptInput - The input type for the regenerateScenePrompt function.
 * - RegenerateScenePromptOutput - The return type for the regenerateScenePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PromptTypeSchema } from '@/lib/types';
import { artisticPromptInstructions } from '@/lib/artistic-prompt-instructions';
import { jsonPromptInstructions } from '@/lib/json-prompt-instructions';

const RegenerateScenePromptInputSchema = z.object({
  sceneDescription: z
    .string()
    .optional()
    .describe('The original detailed description of the scene.'),
  characterInfo: z.string().optional().describe("A string containing the full appearance description and prompt for a character to be included in the scene."),
  referenceImage: z.string().optional().describe("A data URI of a reference image. Analyze this image and use it as the primary visual guide for the scene's composition, style, and mood, but replace elements as described in the text prompt."),
  artStyle: z
    .string()
    .optional()
    .describe('The new art style for the scene.'),
  cameraAngle: z
    .string()
    .optional()
    .describe('The new camera angle or perspective.'),
  lightingStyle: z
    .string()
    .optional()
    .describe('The new type of lighting for the scene.'),
  camera: z.string().optional().describe('The new camera for the shot.'),
  filmType: z.string().optional().describe('The new type of film to be used.'),
  promptType: PromptTypeSchema,
});
export type RegenerateScenePromptInput = z.infer<typeof RegenerateScenePromptInputSchema>;

const RegenerateScenePromptOutputSchema = z.object({
  prompt: z.string().describe('The regenerated prompt for creating the scene image. The prompt must be at least 3000 characters long.'),
});
export type RegenerateScenePromptOutput = z.infer<typeof RegenerateScenePromptOutputSchema>;


export async function regenerateScenePrompt(input: RegenerateScenePromptInput): Promise<RegenerateScenePromptOutput> {
  return regenerateScenePromptFlow(input);
}


const regenerateScenePromptFlow = ai.defineFlow(
  {
    name: 'regenerateScenePromptFlow',
    inputSchema: RegenerateScenePromptInputSchema,
    outputSchema: RegenerateScenePromptOutputSchema,
  },
  async (input) => {
    let basePrompt = `You are an expert prompt engineer. Your task is to REGENERATE a detailed prompt for an image generation model based on an original scene description and a NEW set of parameters. The final prompt must be at least 3000 characters long.

CRITICAL RULE FOR REFERENCE IMAGE: If a reference image ('referenceImage') is provided, you MUST treat it as a blueprint. Your task is to EXACTLY replicate the composition, camera angle, character pose, and overall structure of the reference image. However, you must intelligently REPLACE the subject (character), location, and atmosphere with the NEW details provided in the text inputs ('characterInfo', 'sceneDescription', etc.). Your final prompt should describe a scene that has the same visual structure as the reference image but with the content specified in the text.

You must use the original scene description as the core creative brief, but apply the NEWLY provided parameters (art style, camera, etc.) to it.

If a character description is provided, you MUST seamlessly integrate it into the main scene description. The character should be the central focus of the scene.

If a new parameter is provided, it OVERRIDES any previous setting for that parameter. If a new parameter is not provided or set to 'none', you should choose a suitable option yourself based on the original description.
`;

    if (input.promptType === 'artistic') {
      basePrompt += `
You must generate an artistic prompt. The prompt should be very descriptive.
${artisticPromptInstructions}`;
    } else {
      basePrompt += `
You must generate a JSON prompt. Fill in the JSON structure based on the description and new parameters.
${jsonPromptInstructions}`;
    }

    const fullSceneDescription = input.characterInfo 
      ? `Character to include in scene: ${input.characterInfo}\n\nOriginal Scene Description: ${input.sceneDescription || ''}`
      : `Original Scene Description: ${input.sceneDescription || ''}`;


    const finalPrompt = `${basePrompt}

${fullSceneDescription}

Apply these NEW parameters:
${input.artStyle && input.artStyle !== 'none' ? `New Art Style: ${input.artStyle}` : ''}
${input.cameraAngle && input.cameraAngle !== 'none' ? `New Camera Angle: ${input.cameraAngle}` : ''}
${input.lightingStyle && input.lightingStyle !== 'none' ? `New Lighting Style: ${input.lightingStyle}` : ''}
${input.camera && input.camera !== 'none' ? `New Camera: ${input.camera}` : ''}
${input.filmType && input.filmType !== 'none' ? `New Film Type: ${input.filmType}` : ''}
`;

    const modelName = input.referenceImage ? 'gemini-2.5-flash-image-preview' : 'gemini-2.5-flash';

    const prompt = ai.definePrompt({
        name: 'regenerateScenePrompt',
        input: {schema: RegenerateScenePromptInputSchema},
        output: {schema: RegenerateScenePromptOutputSchema},
        prompt: finalPrompt,
        model: `googleai/${modelName}`
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
