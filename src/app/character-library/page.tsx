'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Character } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

function CharacterCard({ character, onDelete }: { character: Character, onDelete: (id: string) => void }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">{character.name}</CardTitle>
        <CardDescription className="line-clamp-2">
            {character.artStyle}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-4">{character.prompt}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
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

  if (!isClient) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-headline font-bold mb-6">Character Library</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/5" />
                <Skeleton className="h-4 w-4/5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
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
            <CharacterCard key={character.id} character={character} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
