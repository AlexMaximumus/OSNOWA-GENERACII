'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Character } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, UserPlus, Film } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


function CharacterCard({ character, onDelete }: { character: Character; onDelete: (id: string) => void; }) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: `Copied ${type} to clipboard!`,
      });
    });
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1 pr-4">
            <CardTitle className="font-headline">{character.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {character.nationality}
            </CardDescription>
          </div>
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
                <div className="font-medium">Nationality:</div>
                <div className="text-muted-foreground">{character.nationality || 'N/A'}</div>
                <div className="font-medium">Art Style:</div>
                <div className="text-muted-foreground">{character.artStyle || 'N/A'}</div>
                <div className="font-medium">Camera Angle:</div>
                <div className="text-muted-foreground">{character.cameraAngle || 'N/A'}</div>
                <div className="font-medium">Lighting:</div>
                <div className="text-muted-foreground">{character.lightingStyle || 'N-A'}</div>
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Delete ${character.name}`}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your character
                "{character.name}" from your library.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(character.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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

  if (!isClient) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-headline font-bold">Character Library</h1>
        </div>
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
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-headline font-bold">Character Library</h1>
            <Button asChild>
                <Link href="/character-creation">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Character
                </Link>
            </Button>
        </div>
      {characters.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <Film className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold mt-4">Your library is empty.</h2>
          <p className="text-muted-foreground mt-2">Create a new character to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map(character => (
            <CharacterCard key={character.id} character={character} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
