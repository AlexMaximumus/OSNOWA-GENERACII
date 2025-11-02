import { z } from "zod";

// For form validation
export const CharacterFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  age: z.coerce.number().min(0, "Age must be a positive number."),
  occupation: z.string().min(1, "Occupation is required."),
  genre: z.string().min(1, "Genre is required."),
  personality: z.string().min(1, "Personality is required."),
  appearance: z.string().min(1, "Appearance is required."),
  motivations: z.string().min(1, "Motivations are required."),
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
  sceneDescription: z.string().min(1, "Scene description is required."),
  artStyle: z.string().min(1, "Art style is required."),
  cameraAngle: z.string().min(1, "Camera angle is required."),
  lightingStyle: z.string().min(1, "Lighting style is required."),
});
export type SceneFormData = z.infer<typeof SceneFormSchema>;

// For storage
export type Scene = SceneFormData & {
  id: string;
  prompt: string;
  createdAt: string; // Use ISO string for serialization
};
