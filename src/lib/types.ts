import { z } from "zod";

export const PromptTypeSchema = z.enum(["artistic", "json"]);
export type PromptType = z.infer<typeof PromptTypeSchema>;

// For form validation
export const CharacterFormSchema = z.object({
  name: z.string().min(1, "Имя обязательно."),
  age: z.coerce.number().min(0, "Возраст должен быть положительным числом."),
  occupation: z.string().min(1, "Профессия обязательна."),
  genre: z.string().min(1, "Жанр обязателен."),
  personality: z.string().min(1, "Характер обязателен."),
  appearance: z.string().min(1, "Внешность обязательна."),
  motivations: z.string().min(1, "Мотивация обязательна."),
  promptType: PromptTypeSchema.default("artistic"),
});
export type CharacterFormData = z.infer<typeof CharacterFormSchema>;

// For storage
export type Character = CharacterFormData & {
  id: string;
  prompt: string;
  createdAt: string; // Use ISO string for serialization
};

// For form validation
export const SceneFormSchema = z.object({
  sceneDescription: z.string().min(1, "Описание сцены обязательно."),
  artStyle: z.string().min(1, "Художественный стиль обязателен."),
  cameraAngle: z.string().min(1, "Ракурс камеры обязателен."),
  lightingStyle: z.string().min(1, "Стиль освещения обязателен."),
  promptType: PromptTypeSchema.default("artistic"),
});
export type SceneFormData = z.infer<typeof SceneFormSchema>;

// For storage
export type Scene = SceneFormData & {
  id: string;
  prompt: string;
  createdAt: string; // Use ISO string for serialization
};
