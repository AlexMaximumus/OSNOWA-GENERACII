'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, Loader2, Save, Wand, Users, Shirt } from 'lucide-react';
import { generateOutfitPrompt } from '@/ai/flows/generate-outfit-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Character, Outfit, OutfitFormData, OutfitFormSchema } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { photoStyles } from '@/lib/photo-styles';

type GeneratedData = {
  prompt: string;
  name: string;
};

export default function OutfitCreationPage() {
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedData, setLastGeneratedData] = useState<OutfitFormData | null>(null);

  const { toast } = useToast();
  const [outfits, setOutfits] = useLocalStorage<Outfit[]>('outfits', []);
  const [characters] = useLocalStorage<Character[]>('characters', []);

  const form = useForm<OutfitFormData>({
    resolver: zodResolver(OutfitFormSchema),
    defaultValues: {
      characterId: '',
      description: '',
      artStyle: 'none',
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to clipboard!',
      });
    });
  };

  async function onSubmit(data: OutfitFormData) {
    setIsLoading(true);
    setGeneratedData(null);
    setLastGeneratedData(null);

    const character = characters.find(c => c.id === data.characterId);
    if (!character) {
      toast({
        variant: 'destructive',
        title: 'Character not found',
        description: 'Please select a valid character.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await generateOutfitPrompt({
        characterAppearance: character.appearanceDescription,
        outfitDescription: data.description,
        artStyle: data.artStyle,
      });

      if (result.prompt && result.name) {
        setGeneratedData({
            prompt: result.prompt,
            name: result.name,
        });
        setLastGeneratedData(data);
        toast({
          title: 'Outfit Prompt Generated',
          description: `Prompt for "${result.name}" has been created.`,
        });
      } else {
        throw new Error('Outfit prompt was not generated correctly.');
      }
    } catch (error) {
      console.error('Error generating outfit prompt:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate the prompt. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function saveOutfit() {
    if (!generatedData || !lastGeneratedData) return;

    const newOutfit: Outfit = {
      id: crypto.randomUUID(),
      ...lastGeneratedData,
      name: generatedData.name,
      prompt: generatedData.prompt,
      createdAt: new Date().toISOString(),
    };

    setOutfits([newOutfit, ...outfits]);
    toast({
      title: 'Outfit Saved',
      description: `${generatedData.name} has been added to your library.`,
    });
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline font-bold mb-6">Create New Outfit</h1>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Outfit Details</CardTitle>
            <CardDescription>Select a character and describe the outfit.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="characterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Character
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a character..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {characters.length > 0 ? (
                            characters.map((char) => (
                              <SelectItem key={char.id} value={char.id}>{char.name}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="disabled" disabled>No characters in library</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The character who will wear this outfit.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outfit Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={8}
                          placeholder="e.g., A comfortable and stylish winter outfit with a heavy wool coat, a cashmere scarf, and leather boots." 
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
                          <SelectItem value="none">Default</SelectItem>
                          {photoStyles.map((style) => (
                            <SelectItem key={style} value={style}>{style}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                  Generate Outfit Prompt
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="sticky top-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Generated Outfit Prompt</CardTitle>
                <CardDescription>The prompt for your character and outfit.</CardDescription>
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
              <Textarea readOnly value={generatedData.prompt} className="h-full min-h-[400px] text-base" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Your outfit prompt is waiting to be designed...
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={saveOutfit} disabled={!generatedData || isLoading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save to Library
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
