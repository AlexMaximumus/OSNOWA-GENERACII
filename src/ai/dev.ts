import { config } from 'dotenv';
config();

import '@/ai/flows/generate-scene-prompt.ts';
import '@/ai/flows/improve-character-prompt.ts';
import '@/ai/flows/improve-scene-prompt.ts';
import '@/ai/flows/generate-character-prompt.ts';