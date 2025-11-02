import { z } from "zod";

export const PromptTypeSchema = z.enum(["artistic", "json"]);
export type PromptType = z.infer<typeof PromptTypeSchema>;

// For form validation
export const CharacterFormSchema = z.object({
  description: z.string().min(1, "Описание обязательно."),
  artStyle: z.string(),
  cameraAngle: z.string(),
  lightingStyle: z.string(),
  camera: z.string(),
  filmType: z.string(),
  promptType: PromptTypeSchema.default("artistic"),
});
export type CharacterFormData = z.infer<typeof CharacterFormSchema>;

// For storage
export type Character = CharacterFormData & {
  id: string;
  name: string; // Extracted by AI
  prompt: string;
  createdAt: string; // Use ISO string for serialization
};

// For form validation
export const SceneFormSchema = z.object({
  sceneDescription: z.string().min(1, "Описание сцены обязательно."),
  artStyle: z.string(),
  cameraAngle: z.string(),
  lightingStyle: z.string(),
  camera: z.string(),
  filmType: z.string(),
  promptType: PromptTypeSchema.default("artistic"),
});
export type SceneFormData = z.infer<typeof SceneFormSchema>;

// For storage
export type Scene = SceneFormData & {
  id: string;
  prompt: string;
  createdAt: string; // Use ISO string for serialization
};
