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
  name: z.string().describe("The name of the character, extracted from the description. This name is for display ONLY and MUST NOT be used in the prompt."),
  appearanceDescription: z.string().describe('A detailed and unambiguous physical description of the character from head to toe. All details must be explicitly stated.'),
  prompt: z.string().describe('The generated prompt for character creation. This prompt MUST NOT contain the character\'s name.'),
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

Analyze the following character description. Extract the character's name for the 'name' field and generate:
1. An extremely detailed and unambiguous physical description of the character from head to toe for the 'appearanceDescription' field. This must be exhaustive, covering every aspect of their appearance including face shape, eye color, hair style and texture, skin details, body type, posture, and any unique features like scars or tattoos. All details must be explicitly stated so the description can be reused consistently.
2. A detailed prompt for generating an image of this character for the 'prompt' field. This prompt must be at least 3000 characters long.

CRITICAL RULE: The character's name MUST NOT be included in the generated image 'prompt' or the 'appearanceDescription'. The name is only for the UI. The prompt should only contain visual descriptions. If a name is not explicitly provided in the user's description, invent one for the 'name' output field, but do not use it anywhere else.
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
${input.artStyle && input.artStyle !== 'none' ? `Art Style: ${input.artStyle}` : ''}
${input.cameraAngle && input.cameraAngle !== 'none' ? `Camera Angle: ${input.cameraAngle}` : ''}
${input.lightingStyle && input.lightingStyle !== 'none' ? `Lighting Style: ${input.lightingStyle}` : ''}
${input.camera && input.camera !== 'none' ? `Camera: ${input.camera}` : ''}
${input.filmType && input.filmType !== 'none' ? `Film Type: ${input.filmType}` : ''}
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
