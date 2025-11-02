'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, Loader2, Save } from 'lucide-react';
import { generateCharacterPrompt } from '@/ai/flows/generate-character-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Character, CharacterFormData, CharacterFormSchema } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { photoStyles } from '@/lib/photo-styles';
import { cameraAngles } from '@/lib/camera-angles';
import { lightingStyles } from '@/lib/lighting-styles';
import { cameras } from '@/lib/cameras';
import { filmTypes } from '@/lib/film-types';

type GeneratedData = {
  prompt: string;
  name: string;
  appearanceDescription: string;
};

export default function CharacterCreationPage() {
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedCharacter, setLastGeneratedCharacter] = useState<CharacterFormData | null>(null);

  const { toast } = useToast();
  const [characters, setCharacters] = useLocalStorage<Character[]>('characters', []);

  const form = useForm<CharacterFormData>({
    resolver: zodResolver(CharacterFormSchema),
    defaultValues: {
      description: '',
      artStyle: '',
      cameraAngle: '',
      lightingStyle: '',
      camera: '',
      filmType: '',
      promptType: 'artistic',
      creationType: 'inScene',
    },
  });
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to clipboard!',
      });
    });
  };

  async function onSubmit(data: CharacterFormData) {
    setIsLoading(true);
    setGeneratedData(null);
    setLastGeneratedCharacter(null);
    try {
      const result = await generateCharacterPrompt(data);
      if (result.prompt && result.name && result.appearanceDescription) {
        setGeneratedData({
            prompt: result.prompt,
            name: result.name,
            appearanceDescription: result.appearanceDescription
        });
        setLastGeneratedCharacter(data);
        toast({
          title: 'Prompt Generated',
          description: `Your prompt for "${result.name}" has been successfully created.`,
        });
      } else {
        throw new Error('Prompt was not generated correctly.');
      }
    } catch (error) {
      console.error('Error generating character prompt:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate the prompt. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function saveCharacter() {
    if (!generatedData || !lastGeneratedCharacter) return;

    const newCharacter: Character = {
      id: crypto.randomUUID(),
      ...lastGeneratedCharacter,
      name: generatedData.name,
      prompt: generatedData.prompt,
      appearanceDescription: generatedData.appearanceDescription,
      createdAt: new Date().toISOString(),
    };

    setCharacters([newCharacter, ...characters]);
    toast({
      title: 'Character Saved',
      description: `${generatedData.name} has been added to your library.`,
    });
  }

  const creationType = form.watch('creationType');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline font-bold mb-6">Create New Character</h1>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Character Details</CardTitle>
            <CardDescription>Describe your character and select your styles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="creationType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Creation Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="inScene" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              In Scene
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="studio" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Studio Shot
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {creationType === 'inScene' && (
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
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Character Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={8}
                          placeholder="e.g., Alaric, a grim elven ranger with graying hair and a scar across one eye. He wears worn leather armor and carries a yew bow. His goal is to avenge his family." 
                          {...field} 
                        />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an art style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {photoStyles.map((style) => (
                            <SelectItem key={style} value={style}>{style}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {creationType === 'inScene' && (
                  <>
                    <FormField
                      control={form.control}
                      name="cameraAngle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Camera Angle</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a camera angle" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a lighting style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a camera" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a film type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filmTypes.map((film) => (
                                <SelectItem key={film} value={film}>{film}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
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
                <CardDescription>Your AI-generated prompt will appear here.</CardDescription>
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
              <Textarea readOnly value={generatedData.prompt} className="h-full min-h-[300px] text-base" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Your prompt is waiting to be created...
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={saveCharacter} disabled={!generatedData || isLoading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save to Library
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
