import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({
    supportedModels: ['gemini-2.5-flash', 'gemini-2.5-flash-image-preview']
  })],
  model: 'googleai/gemini-2.5-flash',
  flowStateStore: 'firebase', // Or 'file'
  traceStore: 'firebase', // Or 'file'
});
