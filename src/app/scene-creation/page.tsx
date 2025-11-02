'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, Loader2, Save, Wand, Users, RotateCw, Shirt } from 'lucide-react';
import { generateScenePrompt } from '@/ai/flows/generate-scene-prompt';
import { regenerateScenePrompt } from '@/ai/flows/regenerate-scene-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Character, Scene, SceneFormData, SceneFormSchema, Outfit } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { photoStyles } from '@/lib/photo-styles';
import { cameraAngles } from '@/lib/camera-angles';
import { lightingStyles } from '@/lib/lighting-styles';
import { cameras } from '@/lib/cameras';
import { filmTypes } from '@/lib/film-types';
import { useSearchParams } from 'next/navigation';

function SceneCreationForm() {
  const searchParams = useSearchParams();
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [lastGeneratedData, setLastGeneratedData] = useState<SceneFormData | null>(null);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);

  const { toast } = useToast();
  const [scenes, setScenes] = useLocalStorage<Scene[]>('scenes', []);
  const [characters] = useLocalStorage<Character[]>('characters', []);
  const [outfits] = useLocalStorage<Outfit[]>('outfits', []);
  
  const form = useForm<SceneFormData>({
    resolver: zodResolver(SceneFormSchema),
    defaultValues: {
      sceneDescription: '',
      characterId: 'none',
      outfitId: 'none',
      artStyle: 'none',
      cameraAngle: 'none',
      lightingStyle: 'none',
      camera: 'none',
      filmType: 'none',
      promptType: 'artistic',
    },
  });
  
  const selectedCharacterId = form.watch('characterId');
  const availableOutfits = outfits.filter(o => o.characterId === selectedCharacterId);

  useEffect(() => {
    const sceneId = searchParams.get('id');
    if (sceneId) {
      const sceneToEdit = scenes.find(s => s.id === sceneId) ?? Object.fromEntries(searchParams.entries()) as unknown as Scene;
      if (sceneToEdit) {
        setEditingScene(sceneToEdit);
        form.reset({
          ...sceneToEdit,
          characterId: sceneToEdit.characterId || 'none',
          outfitId: sceneToEdit.outfitId || 'none',
        });
        if (sceneToEdit.prompt) {
          setGeneratedPrompt(sceneToEdit.prompt);
        }
        if (sceneToEdit.sceneDescription) {
            setLastGeneratedData(sceneToEdit);
        }
      }
    }
  }, [searchParams, scenes, form]);


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to clipboard!',
      });
    });
  };

  const getCharacterInfo = (data: SceneFormData): string | undefined => {
    if (!data.characterId || data.characterId === 'none') return undefined;
    const character = characters.find(c => c.id === data.characterId);
    if (!character) return undefined;
    
    const outfit = outfits.find(o => o.id === data.outfitId);

    // If an outfit is selected, its prompt is self-contained (includes character appearance).
    if (outfit) {
        return outfit.prompt;
    }

    // Otherwise, use the character's base prompt.
    return `Appearance: ${character.appearanceDescription}\n\nPrompt Context: ${character.prompt}`;
  };

  async function handleGeneration(data: SceneFormData, isRegen: boolean) {
    if (isRegen) {
      setIsRegenerating(true);
    } else {
      setIsLoading(true);
    }
    setGeneratedPrompt(null);
    if(!isRegen) {
      setLastGeneratedData(null);
    }

    try {
      const characterInfo = getCharacterInfo(data);
      
      let result;
      if (isRegen) {
         result = await regenerateScenePrompt({
          ...data,
          characterInfo
        });
      } else {
        result = await generateScenePrompt({
          ...data,
          characterInfo
        });
      }

      if (result.prompt) {
        setGeneratedPrompt(result.prompt);
        if(!isRegen) {
          setLastGeneratedData(data);
        }
        toast({
          title: `Prompt ${isRegen ? 'Regenerated' : 'Generated'}`,
          description: `Your scene prompt has been successfully ${isRegen ? 'updated' : 'created'}.`,
        });
      } else {
        throw new Error('Prompt was not generated correctly.');
      }
    } catch (error) {
      console.error(`Error ${isRegen ? 'regenerating' : 'generating'} scene prompt:`, error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: `Could not ${isRegen ? 'regenerate' : 'generate'} the prompt. Please try again.`,
      });
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  }

  function saveScene() {
    if (!generatedPrompt || !lastGeneratedData) return;
    
    // Get current form state to save selections
    const currentFormData = form.getValues();

    if (editingScene) {
        const updatedScene: Scene = {
            ...editingScene,
            ...lastGeneratedData, // Original description
            ...currentFormData, // Selections like characterId, outfitId etc.
            prompt: generatedPrompt,
        };
        setScenes(scenes.map(s => s.id === editingScene.id ? updatedScene : s));
        toast({
            title: 'Scene Updated',
            description: `The scene has been updated in your library.`,
        });
    } else {
        const newScene: Scene = {
            id: crypto.randomUUID(),
            ...lastGeneratedData,
            ...currentFormData,
            prompt: generatedPrompt,
            createdAt: new Date().toISOString(),
        };
        setScenes([newScene, ...scenes]);
        toast({
            title: 'Scene Saved',
            description: `The scene has been added to your library.`,
        });
    }
  }
  
  const currentPromptType = form.watch('promptType');
  const isArtisticPrompt = currentPromptType === 'artistic';

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline font-bold mb-6">{editingScene ? 'Edit Scene' : 'Create New Scene'}</h1>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Scene Details</CardTitle>
            <CardDescription>Describe your scene and select generation parameters.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => handleGeneration(data, false))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="sceneDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scene Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={8}
                          placeholder="e.g., A quiet, rain-slicked alley in Shinjuku at midnight, illuminated by a single flickering neon sign. A sense of loneliness and mystery." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="characterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Add Character to Scene
                      </FormLabel>
                      <Select onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('outfitId', 'none');
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a character..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Character</SelectItem>
                          {characters.map((char) => (
                            <SelectItem key={char.id} value={char.id}>{char.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select a saved character to include them in the scene.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCharacterId && selectedCharacterId !== 'none' && (
                    <FormField
                    control={form.control}
                    name="outfitId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center">
                            <Shirt className="mr-2 h-4 w-4" />
                            Select Outfit
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger disabled={availableOutfits.length === 0}>
                                <SelectValue placeholder={availableOutfits.length > 0 ? "Select an outfit..." : "No outfits for this character"} />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="none">Default Outfit</SelectItem>
                            {availableOutfits.map((outfit) => (
                                <SelectItem key={outfit.id} value={outfit.id}>{outfit.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            Choose a saved outfit for the selected character.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                <FormField
                  control={form.control}
                  name="promptType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Prompt Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
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
                      <Select onValueChange={field.onChange} value={field.value}>
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

                {isArtisticPrompt && (<>
                  <FormField
                    control={form.control}
                    name="cameraAngle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Camera Angle</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                </>)}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                  {editingScene ? 'Update Prompt' : 'Generate Prompt'}
                </Button>

                {generatedPrompt && (
                   <Button 
                    type="button" 
                    variant="secondary"
                    onClick={form.handleSubmit((data) => handleGeneration(data, true))} 
                    disabled={isRegenerating || isLoading} 
                    className="w-full"
                  >
                    {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                    Regenerate with new settings
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
                <CardDescription>Your AI-generated scene prompt will appear here.</CardDescription>
            </div>
            {generatedPrompt && (
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedPrompt)}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy Prompt</span>
              </Button>
            )}
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isLoading || isRegenerating ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : generatedPrompt ? (
              <Textarea readOnly value={generatedPrompt} className="h-full min-h-[400px] text-base" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Your prompt is waiting to be created...
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={saveScene} disabled={!generatedPrompt || isLoading || isRegenerating} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {editingScene ? 'Update Scene' : 'Save to Library'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function SceneCreationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SceneCreationForm />
        </Suspense>
    )
}
