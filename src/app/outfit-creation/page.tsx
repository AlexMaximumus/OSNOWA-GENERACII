'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, Loader2, Save, Wand, Shirt } from 'lucide-react';
import { generateOutfitPrompt } from '@/ai/flows/generate-outfit-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Outfit, OutfitFormData, OutfitFormSchema } from '@/lib/types';

type GeneratedData = {
  description: string;
  name: string;
};

export default function OutfitCreationPage() {
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedData, setLastGeneratedData] = useState<Pick<OutfitFormData, 'description'>>({ description: '' });

  const { toast } = useToast();
  const [outfits, setOutfits] = useLocalStorage<Outfit[]>('outfits', []);

  const form = useForm<OutfitFormData>({
    resolver: zodResolver(OutfitFormSchema),
    defaultValues: {
      description: '',
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
    setLastGeneratedData({ description: '' });

    try {
      const result = await generateOutfitPrompt({
        outfitDescription: data.description,
      });

      if (result.description && result.name) {
        setGeneratedData({
            description: result.description,
            name: result.name,
        });
        setLastGeneratedData({ description: data.description });
        toast({
          title: 'Outfit Description Generated',
          description: `Description for "${result.name}" has been created.`,
        });
      } else {
        throw new Error('Outfit description was not generated correctly.');
      }
    } catch (error) {
      console.error('Error generating outfit description:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate the description. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function saveOutfit() {
    if (!generatedData || !lastGeneratedData) return;

    const newOutfit: Outfit = {
      id: crypto.randomUUID(),
      characterId: '', // This will be set when assigning the outfit
      ...lastGeneratedData,
      name: generatedData.name,
      prompt: generatedData.description, // Storing the description in the 'prompt' field
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
      <h1 className="text-3xl font-headline font-bold mb-6">Create New Outfit Description</h1>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Outfit Details</CardTitle>
            <CardDescription>Describe the outfit style to generate a detailed description.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outfit Style Description</FormLabel>
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
                
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                  Generate Outfit Description
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="sticky top-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Generated Outfit Description</CardTitle>
                <CardDescription>A detailed description of the outfit.</CardDescription>
            </div>
            {generatedData && (
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedData.description)}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy Description</span>
              </Button>
            )}
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : generatedData ? (
              <Textarea readOnly value={generatedData.description} className="h-full min-h-[400px] text-base" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Your outfit description is waiting to be designed...
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
