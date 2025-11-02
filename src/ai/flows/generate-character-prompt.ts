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
import { PromptTypeSchema } from '@/lib/types';
import { artisticPromptInstructions } from '@/lib/artistic-prompt-instructions';
import { jsonPromptInstructions } from '@/lib/json-prompt-instructions';

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
});
export type GenerateCharacterPromptInput = z.infer<typeof GenerateCharacterPromptInputSchema>;

const GenerateCharacterPromptOutputSchema = z.object({
  name: z.string().describe('The name of the character, extracted from the description.'),
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
    
    const promptText = `Вы — инженер по промптам, специализирующийся на создании подробных промптов для дизайна персонажей.

Проанализируйте следующее описание персонажа. Извлеките из него имя персонажа и сгенерируйте подробный промпт для создания изображения этого персонажа.
Если имя не указано явно, придумайте его.

Если пользователь предоставил конкретные параметры (стиль, камера и т.д.), используйте их. Если нет, выберите подходящие варианты сами, основываясь на общем описании.

${
  input.promptType === 'artistic'
    ? `Вы должны сгенерировать художественный промпт. Промпт должен включать детали о внешности, одежде и окружении персонажа, соответствующие его образу.
${artisticPromptInstructions}`
    : `Вы должны сгенерировать JSON промпт. Заполните JSON структуру на основе описания.
${jsonPromptInstructions}`
}
  
Описание персонажа: ${input.description}
${input.artStyle ? `Художественный стиль: ${input.artStyle}` : ''}
${input.cameraAngle ? `Ракурс камеры: ${input.cameraAngle}` : ''}
${input.lightingStyle ? `Стиль освещения: ${input.lightingStyle}` : ''}
${input.camera ? `Камера: ${input.camera}` : ''}
${input.filmType ? `Тип пленки: ${input.filmType}` : ''}
`;

    const prompt = ai.definePrompt({
        name: 'generateCharacterPromptPrompt',
        input: {schema: GenerateCharacterPromptInputSchema},
        output: {schema: GenerateCharacterPromptOutputSchema},
        prompt: promptText
    });
    const {output} = await prompt(input);
    return output!;
  }
);
