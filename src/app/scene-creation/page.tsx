
'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, Loader2, Save, Wand, Users, RotateCw, Shirt, Library, Star, Trash2, ImagePlus, XCircle } from 'lucide-react';
import { generateScenePrompt } from '@/ai/flows/generate-scene-prompt';
import { regenerateScenePrompt } from '@/ai/flows/regenerate-scene-prompt';
import { analyzeImagePrompt } from '@/ai/flows/analyze-image-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Character, Scene, SceneFormData, SceneFormSchema, Outfit, Location } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { photoStyles } from '@/lib/photo-styles';
import { cameraAngles } from '@/lib/camera-angles';
import { lightingStyles } from '@/lib/lighting-styles';
import { cameras } from '@/lib/cameras';
import { filmTypes } from '@/lib/film-types';
import { useSearchParams } from 'next/navigation';
import { useFavoriteSettings } from '@/hooks/use-favorite-settings';
import { useCompletionVFX } from '@/hooks/use-completion-vfx';
import Image from 'next/image';

function SceneCreationForm() {
  const searchParams = useSearchParams();
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [lastGeneratedData, setLastGeneratedData] = useState<SceneFormData | null>(null);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);


  const { toast } = useToast();
  const [scenes, setScenes] = useLocalStorage<Scene[]>('scenes', []);
  const [characters] = useLocalStorage<Character[]>('characters', []);
  const [outfits, setOutfits] = useLocalStorage<Outfit[]>('outfits', []);
  const [locations] = useLocalStorage<Location[]>('locations', []);
  const { favoriteSettings, saveFavoriteSettings, resetFavoriteSettings } = useFavoriteSettings();
  const { triggerVFX, isVFXActive } = useCompletionVFX();
  
  const form = useForm<SceneFormData>({
    resolver: zodResolver(SceneFormSchema),
    defaultValues: {
      sceneDescription: '',
      adjustments: '',
      characterId: 'none',
      outfitId: 'none',
      locationId: 'none',
      artStyle: favoriteSettings.artStyle,
      cameraAngle: favoriteSettings.cameraAngle,
      lightingStyle: favoriteSettings.lightingStyle,
      camera: favoriteSettings.camera,
      filmType: favoriteSettings.filmType,
      promptType: 'artistic',
    },
  });

  const handleImageAnalysis = useCallback(async (image: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeImagePrompt({ referenceImage: image });
      if (result.imageDescription) {
        form.setValue('sceneDescription', result.imageDescription);
        toast({
          title: 'Image Analyzed',
          description: 'A description has been generated from your image and placed in the description field.',
        });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze the reference image.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [form, toast]);

  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setReferenceImage(dataUrl);
            toast({
              title: 'Image Pasted',
              description: 'Analyzing image to generate description...',
            });
            handleImageAnalysis(dataUrl);
          };
          reader.readAsDataURL(blob);
          event.preventDefault();
        }
      }
    }
  }, [toast, handleImageAnalysis]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);
  
  const availableOutfits = outfits;

  const populateFormWithScene = (scene: Scene) => {
    setEditingScene(scene);
    form.reset({
      ...scene,
      characterId: scene.characterId || 'none',
      outfitId: scene.outfitId || 'none',
      locationId: scene.locationId || 'none',
    });
    if (scene.prompt) {
      setGeneratedPrompt(scene.prompt);
    }
    if (scene.sceneDescription) {
        setLastGeneratedData(scene);
    }
  };

  useEffect(() => {
    const sceneId = searchParams.get('id');
    if (sceneId) {
      const sceneToEdit = scenes.find(s => s.id === sceneId);
      if (sceneToEdit) {
        populateFormWithScene(sceneToEdit);
      }
    }
  }, [searchParams, scenes]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to clipboard!',
      });
    });
  };
  
  const handleSaveFavorites = () => {
    const currentSettings = form.getValues();
    saveFavoriteSettings(currentSettings);
  };

  const getCharacterInfo = (data: SceneFormData): string | undefined => {
    if (!data.characterId || data.characterId === 'none') return undefined;
    const character = characters.find(c => c.id === data.characterId);
    if (!character) return undefined;
    
    const outfit = outfits.find(o => o.id === data.outfitId);

    let characterVisuals = `${character.appearanceDescription}\n${character.prompt}`;
    
    if (outfit) {
        characterVisuals += `\n\nOutfit: ${outfit.prompt}`;
    }

    return characterVisuals;
  };

  const getLocationInfo = (data: SceneFormData): string | undefined => {
    let description = data.sceneDescription;
    if (data.locationId && data.locationId !== 'none') {
        const location = locations.find(l => l.id === data.locationId);
        if (location) {
            description = `Base Location Prompt: ${location.prompt}\n\nAdditional Scene Details: ${data.sceneDescription || ''}`;
        }
    }
    return description;
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
      const sceneInfo = getLocationInfo(data);
      
      let result;
      const promptInput = {
          ...data,
          sceneDescription: sceneInfo,
          characterInfo,
          referenceImage: referenceImage || undefined,
      };

      if (isRegen) {
         result = await regenerateScenePrompt(promptInput);
      } else {
        result = await generateScenePrompt(promptInput);
      }

      if (result.prompt) {
        setGeneratedPrompt(result.prompt);
        if(!isRegen) {
          // Save original form data before it was modified by getLocationInfo
          setLastGeneratedData(data);
        }
        toast({
          title: `Prompt ${isRegen ? 'Regenerated' : 'Generated'}`,
          description: `Your scene prompt has been successfully ${isRegen ? 'updated' : 'created'}.`,
        });
        triggerVFX();
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
    
    const currentFormData = form.getValues();

    const sceneDataToSave = {
        ...lastGeneratedData,
        ...currentFormData,
        prompt: generatedPrompt,
    };

    if (editingScene) {
        const updatedScene: Scene = {
            ...editingScene,
            ...sceneDataToSave,
        };
        setScenes(scenes.map(s => s.id === editingScene.id ? updatedScene : s));
        toast({
            title: 'Scene Updated',
            description: `The scene has been updated in your library.`,
        });
    } else {
        const newScene: Scene = {
            id: crypto.randomUUID(),
            ...sceneDataToSave,
            createdAt: new Date().toISOString(),
        };
        setScenes([newScene, ...scenes]);
        toast({
            title: 'Scene Saved',
            description: `The scene has been added to your library.`,
        });
    }
    
    if (currentFormData.outfitId && currentFormData.outfitId !== 'none' && currentFormData.characterId && currentFormData.characterId !== 'none') {
        setOutfits(outfits.map(o => o.id === currentFormData.outfitId ? { ...o, characterId: currentFormData.characterId! } : o));
    }
  }
  
  const currentPromptType = form.watch('promptType');
  const isArtisticPrompt = currentPromptType === 'artistic';
  const selectedLocationId = form.watch('locationId');

  const handleSceneSelect = (sceneId: string) => {
    if (sceneId === 'none') {
      form.reset({
        sceneDescription: '',
        adjustments: '',
        characterId: 'none',
        outfitId: 'none',
        locationId: 'none',
        artStyle: favoriteSettings.artStyle,
        cameraAngle: favoriteSettings.cameraAngle,
        lightingStyle: favoriteSettings.lightingStyle,
        camera: favoriteSettings.camera,
        filmType: favoriteSettings.filmType,
        promptType: 'artistic',
      });
      setEditingScene(null);
      setGeneratedPrompt(null);
      setLastGeneratedData(null);
      setReferenceImage(null);
      return;
    }
    const sceneToLoad = scenes.find(s => s.id === sceneId);
    if (sceneToLoad) {
      populateFormWithScene(sceneToLoad);
    }
  };

  return (
    <>
      {isVFXActive && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'vfx-fade-out 0.3s ease-out forwards',
          }}
        />
      )}
       <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-headline font-bold mb-6">{editingScene ? 'Edit Scene' : 'Create New Scene'}</h1>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card>
            <CardHeader>
              <CardTitle>Scene Details</CardTitle>
              <CardDescription>Describe your scene, paste a reference image (Ctrl+V), and select parameters.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => handleGeneration(data, false))} className="space-y-4">
                  
                  <FormItem>
                    <FormLabel className="flex items-center"><Library className="mr-2 h-4 w-4" />Load from Library</FormLabel>
                    <Select onValueChange={handleSceneSelect} value={editingScene?.id || 'none'}>
                      <FormControl>
                        <SelectTrigger disabled={scenes.length === 0}>
                          <SelectValue placeholder={scenes.length > 0 ? "Select a scene to edit..." : "No scenes in library"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Create a new scene</SelectItem>
                        {scenes.map((scene) => (
                          <SelectItem key={scene.id} value={scene.id}>{scene.artStyle}: {scene.sceneDescription?.substring(0, 50)}...</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>

                   {referenceImage ? (
                    <FormItem>
                      <FormLabel>Reference Image</FormLabel>
                      <div className="relative w-full aspect-video rounded-md border overflow-hidden">
                        <Image src={referenceImage} alt="Reference" layout="fill" objectFit="contain" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-background/50 hover:bg-background/80 rounded-full h-8 w-8"
                          onClick={() => setReferenceImage(null)}
                        >
                          <XCircle className="h-5 w-5 text-destructive" />
                          <span className="sr-only">Remove reference image</span>
                        </Button>
                      </div>
                    </FormItem>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md text-center">
                      <ImagePlus className="h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Paste an image from your clipboard (Ctrl+V) to use as a reference.
                      </p>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Library className="mr-2 h-4 w-4" />
                          Use Location from Library
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={locations.length === 0}>
                              <SelectValue placeholder={locations.length > 0 ? "Select a location..." : "No locations in library"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Describe location manually</SelectItem>
                            {locations.map((loc) => (
                              <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select a saved location to use its prompt as the base for the scene.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sceneDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scene Description (from Image)</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={6}
                            placeholder="This will be auto-filled when you paste an image."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="adjustments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adjustments</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={4}
                            placeholder="e.g., Change the season to winter. Make the lighting more dramatic. Add rain."
                            {...field}
                          />
                        </FormControl>
                         <FormDescription>
                          Describe any changes you want to make to the scene from the reference image.
                        </FormDescription>
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
                            <SelectTrigger disabled={characters.length === 0}>
                              <SelectValue placeholder={characters.length > 0 ? "Select a character..." : "No characters in library"} />
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

                  {form.watch('characterId') && form.watch('characterId') !== 'none' && (
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
                                  <SelectValue placeholder={availableOutfits.length > 0 ? "Select an outfit..." : "No outfits in library"} />
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
                  
                  <div className="space-y-2 p-4 border rounded-lg">
                      <h3 className="text-lg font-semibold">Generation Settings</h3>
                      <div className="flex items-center gap-2">
                          <Button type="button" size="sm" onClick={handleSaveFavorites}><Star className="mr-2 h-4 w-4" /> Save as Favorite</Button>
                          <Button type="button" size="sm" variant="outline" onClick={resetFavoriteSettings}><Trash2 className="mr-2 h-4 w-4" /> Reset</Button>
                      </div>

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
                  </div>


                  <Button type="submit" disabled={isLoading || isAnalyzing} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                    {editingScene ? 'Update Prompt' : 'Generate Prompt'}
                  </Button>

                  {generatedPrompt && (
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={form.handleSubmit((data) => handleGeneration(data, true))} 
                      disabled={isRegenerating || isLoading || isAnalyzing} 
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
              {isLoading || isRegenerating || isAnalyzing ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                   {isAnalyzing && <p className="ml-2">Analyzing image...</p>}
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
    </>
  );
}

export default function SceneCreationPage() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div>Loading...</div>;
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SceneCreationForm />
        </Suspense>
    )
}
