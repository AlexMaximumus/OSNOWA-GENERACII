'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { generateScenePrompt } from '@/ai/flows/generate-scene-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Scene, SceneFormData, SceneFormSchema } from '@/lib/types';

export default function SceneCreationPage() {
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedScene, setLastGeneratedScene] = useState<SceneFormData | null>(null);

  const { toast } = useToast();
  const [scenes, setScenes] = useLocalStorage<Scene[]>('scenes', []);

  const form = useForm<SceneFormData>({
    resolver: zodResolver(SceneFormSchema),
    defaultValues: {
      sceneDescription: '',
      artStyle: '',
      cameraAngle: '',
      lightingStyle: '',
    },
  });

  async function onSubmit(data: SceneFormData) {
    setIsLoading(true);
    setGeneratedPrompt('');
    setLastGeneratedScene(null);
    try {
      const result = await generateScenePrompt(data);
      if (result.prompt) {
        setGeneratedPrompt(result.prompt);
        setLastGeneratedScene(data);
        toast({
          title: 'Prompt Generated',
          description: 'Your scene prompt has been successfully created.',
        });
      } else {
        throw new Error('No prompt was generated.');
      }
    } catch (error) {
      console.error('Error generating scene prompt:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate a prompt. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function saveScene() {
    if (!generatedPrompt || !lastGeneratedScene) return;

    const newScene: Scene = {
      id: crypto.randomUUID(),
      ...lastGeneratedScene,
      prompt: generatedPrompt,
      createdAt: new Date().toISOString(),
    };

    setScenes([newScene, ...scenes]);
    toast({
      title: 'Scene Saved',
      description: 'The scene has been added to your library.',
    });
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline font-bold mb-6">Create a New Scene</h1>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Scene Details</CardTitle>
            <CardDescription>Fill out the form to generate a scene prompt.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="sceneDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scene Description</FormLabel>
                      <FormControl>
                        <Textarea rows={6} placeholder="e.g., A bustling neon-lit market on a distant planet, rain-slicked streets reflecting the alien sky..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="artStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Art Style</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Photorealistic, Anime, Watercolor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cameraAngle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Camera Angle</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Wide shot, Low angle, Aerial view" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lightingStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lighting Style</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Dramatic, Soft, Golden hour" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Prompt
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Generated Prompt</CardTitle>
            <CardDescription>Your AI-generated prompt will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : generatedPrompt ? (
              <Textarea readOnly value={generatedPrompt} className="h-full min-h-[300px] text-base" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Your prompt is waiting to be forged...
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={saveScene} disabled={!generatedPrompt || isLoading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save to Library
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
