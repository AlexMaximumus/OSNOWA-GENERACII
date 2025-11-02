'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { generateCharacterPrompt } from '@/ai/flows/generate-character-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Character, CharacterFormData, CharacterFormSchema } from '@/lib/types';

export default function CharacterCreationPage() {
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedCharacter, setLastGeneratedCharacter] = useState<CharacterFormData | null>(null);

  const { toast } = useToast();
  const [characters, setCharacters] = useLocalStorage<Character[]>('characters', []);

  const form = useForm<CharacterFormData>({
    resolver: zodResolver(CharacterFormSchema),
    defaultValues: {
      name: '',
      age: 18,
      occupation: '',
      genre: '',
      personality: '',
      appearance: '',
      motivations: '',
    },
  });

  async function onSubmit(data: CharacterFormData) {
    setIsLoading(true);
    setGeneratedPrompt('');
    setLastGeneratedCharacter(null);
    try {
      const result = await generateCharacterPrompt(data);
      if (result.prompt) {
        setGeneratedPrompt(result.prompt);
        setLastGeneratedCharacter(data);
        toast({
          title: 'Prompt Generated',
          description: 'Your character prompt has been successfully created.',
        });
      } else {
        throw new Error('No prompt was generated.');
      }
    } catch (error) {
      console.error('Error generating character prompt:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate a prompt. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function saveCharacter() {
    if (!generatedPrompt || !lastGeneratedCharacter) return;

    const newCharacter: Character = {
      id: crypto.randomUUID(),
      ...lastGeneratedCharacter,
      prompt: generatedPrompt,
      createdAt: new Date().toISOString(),
    };

    setCharacters([newCharacter, ...characters]);
    toast({
      title: 'Character Saved',
      description: `${lastGeneratedCharacter.name} has been added to your library.`,
    });
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline font-bold mb-6">Create a New Character</h1>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Character Details</CardTitle>
            <CardDescription>Fill out the form to generate a character prompt.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Alistair Croft" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 35" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Sci-fi, Fantasy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Interstellar Archeologist" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personality Traits</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe their personality..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="appearance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appearance</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe their appearance..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="motivations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivations</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What drives them?" {...field} />
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
            <Button onClick={saveCharacter} disabled={!generatedPrompt || isLoading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save to Library
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
