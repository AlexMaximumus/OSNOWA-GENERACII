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
          title: 'Промпт создан',
          description: 'Ваш промпт для персонажа был успешно создан.',
        });
      } else {
        throw new Error('Промпт не был сгенерирован.');
      }
    } catch (error) {
      console.error('Ошибка при генерации промпта персонажа:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка генерации',
        description: 'Не удалось сгенерировать промпт. Пожалуйста, попробуйте еще раз.',
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
      title: 'Персонаж сохранен',
      description: `${lastGeneratedCharacter.name} был добавлен в вашу библиотеку.`,
    });
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline font-bold mb-6">Создать нового персонажа</h1>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Детали персонажа</CardTitle>
            <CardDescription>Заполните форму, чтобы сгенерировать промпт для персонажа.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя</FormLabel>
                      <FormControl>
                        <Input placeholder="например, Алистэр Крофт" {...field} />
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
                        <FormLabel>Возраст</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="например, 35" {...field} />
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
                        <FormLabel>Жанр</FormLabel>
                        <FormControl>
                          <Input placeholder="например, Научная фантастика, Фэнтези" {...field} />
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
                      <FormLabel>Профессия</FormLabel>
                      <FormControl>
                        <Input placeholder="например, Межзвездный археолог" {...field} />
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
                      <FormLabel>Черты характера</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Опишите его характер..." {...field} />
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
                      <FormLabel>Внешность</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Опишите его внешность..." {...field} />
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
                      <FormLabel>Мотивация</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Что им движет?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Сгенерировать промпт
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Сгенерированный промпт</CardTitle>
            <CardDescription>Ваш AI-сгенерированный промпт появится здесь.</CardDescription>
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
                Ваш промпт ждет, чтобы его создали...
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={saveCharacter} disabled={!generatedPrompt || isLoading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Сохранить в библиотеку
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
