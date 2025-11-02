'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
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

export default function CharacterCreationPage() {
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [characterName, setCharacterName] = useState('');
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
    },
  });

  async function onSubmit(data: CharacterFormData) {
    setIsLoading(true);
    setGeneratedPrompt('');
    setCharacterName('');
    setLastGeneratedCharacter(null);
    try {
      const result = await generateCharacterPrompt(data);
      if (result.prompt && result.name) {
        setGeneratedPrompt(result.prompt);
        setCharacterName(result.name);
        setLastGeneratedCharacter(data);
        toast({
          title: 'Промпт создан',
          description: `Ваш промпт для персонажа "${result.name}" был успешно создан.`,
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
    if (!generatedPrompt || !lastGeneratedCharacter || !characterName) return;

    const newCharacter: Character = {
      id: crypto.randomUUID(),
      ...lastGeneratedCharacter,
      name: characterName,
      prompt: generatedPrompt,
      createdAt: new Date().toISOString(),
    };

    setCharacters([newCharacter, ...characters]);
    toast({
      title: 'Персонаж сохранен',
      description: `${characterName} был добавлен в вашу библиотеку.`,
    });
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline font-bold mb-6">Создать нового персонажа</h1>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Детали персонажа</CardTitle>
            <CardDescription>Опишите вашего персонажа и выберите стили.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="promptType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Тип промпта</FormLabel>
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
                              Художественный
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание персонажа</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={8}
                          placeholder="Например: Аларик, мрачный эльфийский следопыт с седыми волосами и шрамом на глазу. Он одет в потертую кожаную броню и носит лук из тисового дерева. Его цель - отомстить за свою семью." 
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
                      <FormLabel>Художественный стиль</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите художественный стиль" />
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
                <FormField
                  control={form.control}
                  name="cameraAngle"
                  render={({ field }) => (
                     <FormItem>
                      <FormLabel>Ракурс камеры</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите ракурс камеры" />
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
                      <FormLabel>Стиль освещения</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите стиль освещения" />
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
                      <FormLabel>Камера</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите камеру" />
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
                      <FormLabel>Тип пленки</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип пленки" />
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
