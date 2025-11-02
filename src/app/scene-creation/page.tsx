'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, Loader2, Save, Wand, RefreshCw } from 'lucide-react';
import { generateScenePrompt } from '@/ai/flows/generate-scene-prompt';
import { regenerateScenePrompt } from '@/ai/flows/regenerate-scene-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Scene, SceneFormData, SceneFormSchema } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { photoStyles } from '@/lib/photo-styles';
import { cameraAngles } from '@/lib/camera-angles';
import { lightingStyles } from '@/lib/lighting-styles';
import { cameras } from '@/lib/cameras';
import { filmTypes } from '@/lib/film-types';

type GeneratedData = {
  prompt: string;
};

export default function SceneCreationPage() {
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [lastGeneratedScene, setLastGeneratedScene] = useState<SceneFormData | null>(null);

  const { toast } = useToast();
  const [scenes, setScenes] = useLocalStorage<Scene[]>('scenes', []);

  const form = useForm<SceneFormData>({
    resolver: zodResolver(SceneFormSchema),
    defaultValues: {
      sceneDescription: '',
      artStyle: 'none',
      cameraAngle: 'none',
      lightingStyle: 'none',
      camera: 'none',
      filmType: 'none',
      promptType: 'artistic',
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to clipboard!',
      });
    });
  };

  async function onSubmit(data: SceneFormData) {
    setIsLoading(true);
    setGeneratedData(null);
    setLastGeneratedScene(null);
    try {
      const result = await generateScenePrompt(data);
      if (result.prompt) {
        setGeneratedData({
            prompt: result.prompt,
        });
        setLastGeneratedScene(data);
        toast({
          title: 'Prompt Generated',
          description: `Your scene prompt has been successfully created.`,
        });
      } else {
        throw new Error('Prompt was not generated correctly.');
      }
    } catch (error) {
      console.error('Error generating scene prompt:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate the prompt. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegenerate(data: SceneFormData) {
    if (!lastGeneratedScene?.sceneDescription) return;

    setIsRegenerating(true);
    try {
      const result = await regenerateScenePrompt({
        ...data,
        sceneDescription: lastGeneratedScene.sceneDescription, // Use original description
      });

      if (result.prompt) {
        setGeneratedData({ prompt: result.prompt });
        setLastGeneratedScene(data); // Update last generated with new params
        toast({
          title: 'Prompt Updated',
          description: 'The prompt has been updated with your new settings.',
        });
      } else {
        throw new Error('Prompt was not regenerated correctly.');
      }
    } catch (error) {
      console.error('Error regenerating scene prompt:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the prompt. Please try again.',
      });
    } finally {
      setIsRegenerating(false);
    }
  }

  function saveScene() {
    if (!generatedData || !lastGeneratedScene) return;

    const newScene: Scene = {
      id: crypto.randomUUID(),
      ...lastGeneratedScene,
      prompt: generatedData.prompt,
      createdAt: new Date().toISOString(),
    };

    setScenes([newScene, ...scenes]);
    toast({
      title: 'Scene Saved',
      description: `The scene has been added to your library.`,
    });
  }

  // Watch for changes in form fields to trigger regeneration
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (generatedData && name !== 'sceneDescription' && type === 'change') {
        handleRegenerate(form.getValues());
      }
    });
    return () => subscription.unsubscribe();
  }, [form, generatedData, handleRegenerate]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline font-bold mb-6">Create New Scene</h1>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Scene Details</CardTitle>
            <CardDescription>Describe your scene and select your styles.</CardDescription>
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
                        <Textarea 
                          rows={8}
                          placeholder="e.g., A quiet, rain-slicked street in Kyoto at dusk. Neon signs reflect in the puddles. A lone figure walks under an umbrella." 
                          {...field}
                          disabled={!!generatedData}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="promptType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Prompt Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="artistic" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Artistic
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="json" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              JSON
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an art style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {photoStyles.map((style) => (
                            <SelectItem key={style} value={style}>{style}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a camera angle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectItem value="none">None</SelectItem>
                          {cameraAngles.map((angle) => (
                            <SelectItem key={angle} value={angle}>{angle}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a lighting style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {lightingStyles.map((style) => (
                            <SelectItem key={style} value={style}>{style}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="camera"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Camera</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a camera" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {cameras.map((camera) => (
                            <SelectItem key={camera} value={camera}>{camera}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="filmType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Film Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a film type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {filmTypes.map((film) => (
                            <SelectItem key={film} value={film}>{film}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!generatedData && (
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                    Generate Prompt
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="sticky top-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Generated Prompt</CardTitle>
                <CardDescription>Your AI-generated prompt will appear here.</CardDescription>
            </div>
            {generatedData && (
              <div className="flex items-center gap-2">
                {isRegenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedData.prompt)}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy Prompt</span>
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : generatedData ? (
              <Textarea readOnly value={generatedData.prompt} className="h-full min-h-[300px] text-base" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Your prompt is waiting to be created...
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={saveScene} disabled={!generatedData || isLoading || isRegenerating} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save to Library
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
