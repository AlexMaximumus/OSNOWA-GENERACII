'use server';

/**
 * @fileOverview Analyzes an image and generates a descriptive prompt.
 *
 * - analyzeImagePrompt - A function that handles the image analysis.
 * - AnalyzeImagePromptInput - The input type for the analyzeImagePrompt function.
 * - AnalyzeImagePromptOutput - The return type for the analyzeImagePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {generateContent} from 'genkit/ai';

const AnalyzeImagePromptInputSchema = z.object({
  referenceImage: z
    .string()
    .describe(
      "A data URI of a reference image. Analyze this image and generate a detailed description of its composition, style, mood, pose, and camera angle."
    ),
});
export type AnalyzeImagePromptInput = z.infer<
  typeof AnalyzeImagePromptInputSchema
>;

const AnalyzeImagePromptOutputSchema = z.object({
  imageDescription: z
    .string()
    .describe('The detailed text description generated from the image.'),
});
export type AnalyzeImagePromptOutput = z.infer<
  typeof AnalyzeImagePromptOutputSchema
>;

export async function analyzeImagePrompt(
  input: AnalyzeImagePromptInput
): Promise<AnalyzeImagePromptOutput> {
  return analyzeImagePromptFlow(input);
}

const analyzeImagePromptFlow = ai.defineFlow(
  {
    name: 'analyzeImagePromptFlow',
    inputSchema: AnalyzeImagePromptInputSchema,
    outputSchema: AnalyzeImagePromptOutputSchema,
  },
  async ({referenceImage}) => {
    const prompt = `Analyze the provided image in detail. Your task is to generate a rich, descriptive text that captures its essence.
Focus on the following aspects:
1.  **Composition & Framing:** Describe the camera angle, shot type (e.g., wide shot, close-up, portrait), and how the subject and elements are framed.
2.  **Pose & Subject:** If there's a person, describe their exact pose, posture, gaze, and expression.
3.  **Lighting:** Describe the lighting style (e.g., soft, dramatic, natural, golden hour).
4.  **Atmosphere & Mood:** Describe the overall feeling of the image (e.g., calm, mysterious, spontaneous, nostalgic).
5.  **Environment:** Briefly describe the key elements of the background and setting.

Generate a single, cohesive text block for the 'imageDescription' field that can be used as a base for a new prompt.`;

    const {output} = await generateContent({
      model: 'googleai/gemini-2.5-flash',
      output: {schema: AnalyzeImagePromptOutputSchema},
      prompt: [
        {text: prompt},
        {media: {url: referenceImage}},
      ],
    });

    return output;
  }
);
