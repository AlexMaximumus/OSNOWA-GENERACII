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
    .describe('Preferred art style for the scene (e.g., photorealistic, painting, cartoon).'),
  cameraAngle: z
    .string()
    .describe('Desired camera angle or perspective (e.g., wide shot, close-up, aerial view).'),
  lightingStyle: z
    .string()
    .describe('Type of lighting for the scene (e.g., soft, dramatic, natural).'),
  camera: z.string().describe('The camera used for the shot.'),
  filmType: z.string().describe('The type of film used.'),
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

const prompt = ai.definePrompt({
  name: 'generateScenePrompt',
  input: {schema: GenerateScenePromptInputSchema},
  output: {schema: GenerateScenePromptOutputSchema},
  prompt: `Вы — эксперт-инженер по промптам, специализирующийся на создании подробных и оптимизированных промптов для генерации изображений сцен на основе пользовательских вводов.
  
  {{#ifCond promptType "==" "artistic"}}
  ${artisticPromptInstructions}
  {{/ifCond}}
  {{#ifCond promptType "==" "json"}}
  ${jsonPromptInstructions}
  {{/ifCond}}

  На основе следующих деталей сцены сгенерируйте исчерпывающий промпт, который можно использовать с моделями генерации изображений ИИ, такими как DALL-E, Midjourney или Stable Diffusion, для создания визуально убедительной сцены.

  Описание сцены: {{{sceneDescription}}}
  Художественный стиль: {{{artStyle}}}
  Ракурс камеры: {{{cameraAngle}}}
  Стиль освещения: {{{lightingStyle}}}
  Камера: {{{camera}}}
  Тип пленки: {{{filmType}}}

  Сгенерированный промпт должен быть очень описательным и включать детали об окружении, персонажах (если есть), объектах, атмосфере и общей композиции, чтобы направить модель ИИ на создание желаемой сцены.
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
