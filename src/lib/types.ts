import { z } from "zod";

export const PromptTypeSchema = z.enum(["artistic", "json"]);
export type PromptType = z.infer<typeof PromptTypeSchema>;

// For form validation
export const CharacterFormSchema = z.object({
  description: z.string().min(1, "Описание обязательно."),
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
  artStyle: z.string().min(1, "Художественный стиль обязателен."),
  cameraAngle: z.string().min(1, "Ракурс камеры обязателен."),
  lightingStyle: z.string().min(1, "Стиль освещения обязателен."),
  camera: z.string().min(1, "Выбор камеры обязателен."),
  filmType: z.string().min(1, "Выбор пленки обязателен."),
  promptType: PromptTypeSchema.default("artistic"),
});
export type SceneFormData = z.infer<typeof SceneFormSchema>;

// For storage
export type Scene = SceneFormData & {
  id: string;
  prompt: string;
  createdAt: string; // Use ISO string for serialization
};
