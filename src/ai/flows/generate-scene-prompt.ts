'use server';

/**
 * @fileOverview Generates an optimized prompt for scene generation based on user inputs.
 *
 * - generateScenePrompt - A function that generates the scene prompt.
 * - GenerateScenePromptInput - The input type for the generateScenePrompt function A soft film photo taken on a {camera} with a {filmType} lens, 
shot from a {cameraAngle}, 
the scene shows [main character: young woman / man / couple / group of people], 
they are [action: provide an exhaustive description of what they are doing, their posture, where they are looking, the precise position of their hands, the state of their hair, and how their clothes hang or move], 
location is [specific place: describe the location in extreme detail, such as a quiet backstreet / riverside / park bench / seaside walk], 
lighting is {lightingStyle}, 
the background includes [environment details: meticulously describe every visible element like buildings, signs, wires, bicycles, windows, plants, paths, water, and shadows, adding nuance and texture to each], 
colors are [be very specific about the color palette, such as cool tones with slightly faded, natural film grain, no digital sharpness, and a soft pastel mood, describing how colors interact], 
the atmosphere feels [sensations: elaborate on the sensory experience, including light wind, specific street sounds, smells of food or nature, distant conversations, and the feeling of the air], 
extra details: [micro-details: focus on the smallest details like the folds and texture of clothing, the subtle movement of a single strand of hair, the specific shape of a branch's shadow, complex reflections on wet asphalt, the weave of the fabric, and the specific wear-and-tear on sneakers], 
overall: [description of feeling — create a comprehensive summary of the feeling, such as spontaneous, imperfect, deeply calm, authentic, embodying the wabi-sabi aesthetic, and a natural, immersive film mood].
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
