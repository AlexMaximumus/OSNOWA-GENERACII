
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
    .optional()
    .describe('Detailed description of the scene including environment, time of day, and mood. This may contain a pre-analyzed description from a reference image.'),
  adjustments: z.string().optional().describe('User-provided modifications to apply to the scene description.'),
  characterInfo: z.string().optional().describe("A string containing the full, consistent, and detailed visual appearance description and prompt for a character. This MUST NOT contain a name."),
  nationality: z.string().optional().describe("The nationality/gender of a temporary character if no character is selected from the library."),
  referenceImage: z.string().optional().describe("This is for context but the main prompt logic should rely on sceneDescription which might be derived from this image."),
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

Your primary task is to synthesize multiple pieces of information into a single, cohesive, and extremely detailed prompt.

1.  **Base Description**: You will receive a 'sceneDescription', which is often automatically generated from a reference image. This is the foundational blueprint of the scene's composition, pose, and mood. You MUST treat it as the primary source of truth for the scene's structure.
2.  **Adjustments**: You will receive 'adjustments'. These are the user's explicit instructions on how to modify the 'sceneDescription'. You must apply these adjustments to the base description. For example, if the base description says "sunny day" and the adjustments say "change to a rainy night", the final prompt must describe a rainy night.
3.  **Character Integration**: 
    - If a 'characterInfo' (a pre-defined character from the library) is provided, you MUST seamlessly integrate it into the modified scene description. This 'characterInfo' contains a pre-made, detailed visual description and should be used as-is to ensure consistency.
    - If 'characterInfo' is NOT provided, but a 'nationality' is, you must generate a new character for the scene based on that nationality and the scene context. The character should be the central focus.
4.  **Location Synthesis**: If the description includes a base location prompt and additional details, you must synthesize them. Use the base location prompt as the foundation and expertly weave the additional scene details and adjustments into it.
5.  **Stylistic Parameters**: If the user has provided specific parameters (art style, camera, etc.), you must use them. If a parameter is not provided or set to 'none', you must choose a suitable option yourself based on the overall description.
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

    let fullSceneDescription = `Scene Description: ${input.sceneDescription || ''}`;
    if (input.characterInfo) {
      fullSceneDescription = `Visual Character Description to include in scene: ${input.characterInfo}\n\n${fullSceneDescription}`;
    } else if (input.nationality) {
      fullSceneDescription = `Nationality for a new character to generate for the scene: ${input.nationality}\n\n${fullSceneDescription}`;
    }


    const finalPrompt = `${basePrompt}

Base Scene: ${fullSceneDescription}
Adjustments to apply: ${input.adjustments || 'None'}
${input.artStyle && input.artStyle !== 'none' ? `Art Style: ${input.artStyle}` : ''}
${input.cameraAngle && input.cameraAngle !== 'none' ? `Camera Angle: ${input.cameraAngle}` : ''}
${input.lightingStyle && input.lightingStyle !== 'none' ? `Lighting Style: ${input.lightingStyle}` : ''}
${input.camera && input.camera !== 'none' ? `Camera: ${input.camera}` : ''}
${input.filmType && input.filmType !== 'none' ? `Film Type: ${input.filmType}` : ''}
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
