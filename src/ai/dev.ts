'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-scene-prompt.ts';
import '@/ai/flows/improve-character-prompt.ts';
import '@/ai/flows/improve-scene-prompt.ts';
import '@/ai/flows/generate-character-prompt.ts';
import '@/ai/flows/regenerate-scene-prompt.ts';
import '@/ai/flows/generate-outfit-prompt.ts';
import '@/ai/flows/generate-location-prompt.ts';
import '@/ai/flows/analyze-image-prompt.ts';
