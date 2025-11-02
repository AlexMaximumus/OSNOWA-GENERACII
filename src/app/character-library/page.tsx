'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Character, CharacterFormData, CharacterFormSchema } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, UserPlus, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { photoStyles } from '@/lib/photo-styles';
import { cameraAngles } from '@/lib/camera-angles';
import { lightingStyles } from '@/lib/lighting-styles';
import { cameras } from '@/lib/cameras';
import { filmTypes } from '@/lib/film-types';


function CharacterCard({ character, onDelete, onUpdate }: { character: Character, onDelete: (id: string) => void, onUpdate: (id: string, data: CharacterFormData) => void }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<CharacterFormData>({
    resolver: zodResolver(CharacterFormSchema),
    defaultValues: {
      description: character.description,
      artStyle: character.artStyle,
      cameraAngle: character.cameraAngle,
      lightingStyle: character.lightingStyle,
      camera: character.camera,
      filmType: character.filmType,
      promptType: character.promptType,
      creationType: character.creationType,
    },
  });

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: `Copied ${type} to clipboard!`,
      });
    });
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    form.reset({
      description: character.description,
      artStyle: character.artStyle,
      cameraAngle: character.cameraAngle,
      lightingStyle: character.lightingStyle,
      camera: character.camera,
      filmType: character.filmType,
      promptType: character.promptType,
      creationType: character.creationType,
    });
  };

  const handleSave = (data: CharacterFormData) => {
    onUpdate(character.id, data);
    setIsEditing(false);
  };

  const creationType = form.watch('creationType');

  if (isEditing) {
    return (
      <Card className="flex flex-col">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)}>
            <CardHeader>
              <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Character Name (from description)</FormLabel>
                      <FormControl>
                          <Input defaultValue={character.name} className="font-headline text-lg" disabled />
                      </FormControl>
                      </FormItem>
                  )}
              />
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                          <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
              />

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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a camera angle" />
                          </Trigger>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a lighting style" />
                          </Trigger>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </CardContent>
            <CardFooter className="flex justify-end items-center gap-2 mt-4">
              <Button variant="ghost" size="sm" onClick={handleCancel} type="button">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button variant="default" size="sm" type="submit">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="font-headline">{character.name}</CardTitle>
            <CardDescription className="line-clamp-2">
                {character.description}
            </CardDescription>
          </div>
           <Button variant="ghost" size="icon" onClick={handleEdit} aria-label={`Edit ${character.name}`}>
              <Edit className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="appearance">
            <AccordionTrigger>Appearance</AccordionTrigger>
            <AccordionContent>
              <div className="relative">
                <p className="text-sm text-muted-foreground pr-10">{character.appearanceDescription}</p>
                 <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-8 w-8"
                  onClick={() => copyToClipboard(character.appearanceDescription, 'Appearance')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="prompt">
            <AccordionTrigger>Generated Prompt</AccordionTrigger>
            <AccordionContent>
              <div className="relative">
                 <p className="text-sm text-muted-foreground whitespace-pre-wrap pr-10">{character.prompt}</p>
                 <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-8 w-8"
                  onClick={() => copyToClipboard(character.prompt, 'Prompt')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="settings">
            <AccordionTrigger>Generation Settings</AccordionTrigger>
            <AccordionContent>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="font-medium">Creation Type:</div>
                    <div className="text-muted-foreground">{character.creationType}</div>
                    <div className="font-medium">Prompt Type:</div>
                    <div className="text-muted-foreground">{character.promptType}</div>
                    <div className="font-medium">Art Style:</div>
                    <div className="text-muted-foreground">{character.artStyle || 'N/A'}</div>
                    <div className="font-medium">Camera Angle:</div>
                    <div className="text-muted-foreground">{character.cameraAngle || 'N/A'}</div>
                    <div className="font-medium">Lighting:</div>
                    <div className="text-muted-foreground">{character.lightingStyle || 'N/A'}</div>
                    <div className="font-medium">Camera:</div>
                    <div className="text-muted-foreground">{character.camera || 'N/A'}</div>
                    <div className="font-medium">Film Type:</div>
                    <div className="text-muted-foreground">{character.filmType || 'N/A'}</div>
                </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-4">
        <p className="text-xs text-muted-foreground">
          Created {formatDistanceToNow(new Date(character.createdAt), { addSuffix: true })}
        </p>
        <Button variant="ghost" size="icon" onClick={() => onDelete(character.id)} aria-label={`Delete ${character.name}`}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CharacterLibraryPage() {
  const [characters, setCharacters] = useLocalStorage<Character[]>('characters', []);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDelete = (id: string) => {
    const characterToDelete = characters.find(c => c.id === id);
    setCharacters(characters.filter(c => c.id !== id));
    toast({
      title: 'Character Deleted',
      description: `${characterToDelete?.name} has been deleted from your library.`,
      variant: 'destructive',
    });
  };

  const handleUpdate = (id: string, data: CharacterFormData) => {
    setCharacters(
      characters.map(c => 
        c.id === id 
          ? { ...c, ...data, name: c.name, prompt: c.prompt, appearanceDescription: c.appearanceDescription } 
          : c
      )
    );
    const updatedCharacter = characters.find(c => c.id === id);
    toast({
      title: 'Character Updated',
      description: `${updatedCharacter?.name} has been successfully updated. Note that the prompt itself has not been regenerated.`,
    });
  };


  if (!isClient) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-headline font-bold mb-6">Character Library</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/5" />
                <Skeleton className="h-4 w-4/5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline font-bold mb-6">Character Library</h1>
      {characters.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Your library is empty.</h2>
          <p className="text-muted-foreground mt-2">Create a new character to get started.</p>
          <Button asChild className="mt-4">
            <Link href="/character-creation">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Character
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map(character => (
            <CharacterCard key={character.id} character={character} onDelete={handleDelete} onUpdate={handleUpdate}/>
          ))}
        </div>
      )}
    </div>
  );
}

    