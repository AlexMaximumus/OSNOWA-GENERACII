import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
  flowStateStore: 'firebase', // Or 'file'
  traceStore: 'firebase', // Or 'file'
});
