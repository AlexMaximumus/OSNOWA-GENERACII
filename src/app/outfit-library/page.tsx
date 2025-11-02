'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Outfit, Character } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, Shirt, User, Library } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

function OutfitCard({ outfit, onDelete }: { outfit: Outfit; onDelete: (id: string) => void; }) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied description to clipboard!',
      });
    });
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">{outfit.name}</CardTitle>
                <CardDescription className="flex items-center pt-1">
                    {outfit.description}
                </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(outfit.prompt)}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy Description</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-4">{outfit.prompt}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-4">
        <p className="text-xs text-muted-foreground">
          Created {formatDistanceToNow(new Date(outfit.createdAt), { addSuffix: true })}
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Delete ${outfit.name}`}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the outfit
                "{outfit.name}" from your library.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(outfit.id)}
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

export default function OutfitLibraryPage() {
  const [outfits, setOutfits] = useLocalStorage<Outfit[]>('outfits', []);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDelete = (id: string) => {
    const outfitToDelete = outfits.find(o => o.id === id);
    setOutfits(outfits.filter(o => o.id !== id));
    toast({
      title: 'Outfit Deleted',
      description: `${outfitToDelete?.name} has been deleted from your library.`,
      variant: 'destructive',
    });
  };

  if (!isClient) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-headline font-bold">Outfit Library</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/5" />
                <Skeleton className="h-4 w-4/5 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
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
            <h1 className="text-3xl font-headline font-bold">Outfit Library</h1>
            <Button asChild>
                <Link href="/outfit-creation">
                    <Shirt className="mr-2 h-4 w-4" />
                    Create Outfit
                </Link>
            </Button>
        </div>
      {outfits.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <Library className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold mt-4">Your wardrobe is empty.</h2>
          <p className="text-muted-foreground mt-2">Create a new outfit to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outfits.map(outfit => (
            <OutfitCard key={outfit.id} outfit={outfit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
