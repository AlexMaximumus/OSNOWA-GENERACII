'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, Loader2, Save, Map, Star, Trash2 } from 'lucide-react';
import { generateLocationPrompt } from '@/ai/flows/generate-location-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/componentsui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Location, LocationFormData, LocationFormSchema } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { photoStyles } from '@/lib/photo-styles';
import { cameraAngles } from '@/lib/camera-angles';
import { lightingStyles } from '@/lib/lighting-styles';
import { cameras } from '@/lib/cameras';
import { filmTypes } from '@/lib/film-types';
import { useFavoriteSettings } from '@/hooks/use-favorite-settings';

type GeneratedData = {
  prompt: string;
  name: string;
};

export default function LocationCreationPage() {
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedLocation, setLastGeneratedLocation] = useState<LocationFormData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { toast } = useToast();
  const [locations, setLocations] = useLocalStorage<Location[]>('locations', []);
  const { favoriteSettings, saveFavoriteSettings, resetFavoriteSettings } = useFavoriteSettings();

  const form = useForm<LocationFormData>({
    resolver: zodResolver(LocationFormSchema),
    defaultValues: {
      description: '',
      artStyle: favoriteSettings.artStyle,
      cameraAngle: favoriteSettings.cameraAngle,
      lightingStyle: favoriteSettings.lightingStyle,
      camera: favoriteSettings.camera,
      filmType: favoriteSettings.filmType,
      promptType: 'artistic',
    },
  });

   useEffect(() => {
    if (isClient) {
      form.reset({
        ...form.getValues(),
        ...favoriteSettings,
      });
    }
  }, [isClient, favoriteSettings, form]);
  
  const handleSaveFavorites = () => {
    const currentSettings = form.getValues();
    saveFavoriteSettings(currentSettings);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to clipboard!',
      });
    });
  };

  async function onSubmit(data: LocationFormData) {
    setIsLoading(true);
    setGeneratedData(null);
    setLastGeneratedLocation(null);
    try {
      const result = await generateLocationPrompt(data);
      if (result.prompt && result.name) {
        setGeneratedData({
            prompt: result.prompt,
            name: result.name,
        });
        setLastGeneratedLocation(data);
        toast({
          title: 'Location Prompt Generated',
          description: `Your prompt for "${result.name}" has been successfully created.`,
        });
      } else {
        throw new Error('Prompt was not generated correctly.');
      }
    } catch (error) {
      console.error('Error generating location prompt:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate the prompt. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function saveLocation() {
    if (!generatedData || !lastGeneratedLocation) return;

    const newLocation: Location = {
      id: crypto.randomUUID(),
      ...lastGeneratedLocation,
      name: generatedData.name,
      prompt: generatedData.prompt,
      createdAt: new Date().toISOString(),
    };

    setLocations([newLocation, ...locations]);
    toast({
      title: 'Location Saved',
      description: `${generatedData.name} has been added to your library.`,
    });
  }

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline font-bold mb-6">Create New Location</h1>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
            <CardDescription>Describe your location and select styles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={8}
                          placeholder="e.g., A cozy, cluttered bookstore in a quiet alley. Sunlight streams through a dusty window, illuminating floating dust motes. The air smells of old paper and leather." 
                          {...field} 
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
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Prompt
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="sticky top-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Generated Prompt</CardTitle>
                <CardDescription>Your AI-generated location prompt will appear here.</CardDescription>
            </div>
            {generatedData && (
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedData.prompt)}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy Prompt</span>
              </Button>
            )}
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : generatedData ? (
              <Textarea 
                readOnly 
                value={generatedData.prompt} 
                className="h-full min-h-[300px] text-base cursor-copy"
                onClick={() => copyToClipboard(generatedData.prompt)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Your location prompt is waiting to be created...
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={saveLocation} disabled={!generatedData || isLoading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save to Library
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
