'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Scene } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, MountainSnow, Trash2, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

function SceneCard({ scene, onDelete }: { scene: Scene, onDelete: (id: string) => void }) {
    const { toast } = useToast();
    const router = useRouter();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
        toast({
            title: 'Copied prompt to clipboard!',
        });
        });
    };

    const handleEdit = () => {
      const query = new URLSearchParams(scene as any).toString();
      router.push(`/scene-creation?${query}`);
    };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className='flex justify-between items-start'>
            <div>
                <CardTitle className="font-headline line-clamp-1">Style: {scene.artStyle || 'N/A'}</CardTitle>
                <CardDescription>
                {scene.cameraAngle || 'N/A'}, {scene.lightingStyle || 'N/A'} lighting
                </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(scene.prompt)}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy Prompt</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{scene.sceneDescription}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-4">
        <p className="text-xs text-muted-foreground">
          Created {formatDistanceToNow(new Date(scene.createdAt), { addSuffix: true })}
        </p>
        <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={handleEdit} aria-label="Edit scene">
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Delete scene">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this scene
                    from your library.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(scene.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function SceneLibraryPage() {
  const [scenes, setScenes] = useLocalStorage<Scene[]>('scenes', []);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDelete = (id: string) => {
    setScenes(scenes.filter(s => s.id !== id));
    toast({
      title: 'Scene Deleted',
      description: 'The scene has been deleted from your library.',
      variant: 'destructive',
    });
  };

  if (!isClient) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-headline font-bold">Scene Library</h1>
            <Button asChild>
                <Link href="/scene-creation">
                    <MountainSnow className="mr-2 h-4 w-4" />
                    Create Scene
                </Link>
            </Button>
        </div>
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
      <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-headline font-bold">Scene Library</h1>
            <Button asChild>
                <Link href="/scene-creation">
                    <MountainSnow className="mr-2 h-4 w-4" />
                    Create Scene
                </Link>
            </Button>
        </div>
      {scenes.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <MountainSnow className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold mt-4">Your library is empty.</h2>
          <p className="text-muted-foreground mt-2">Create a new scene to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenes.map(scene => (
            <SceneCard key={scene.id} scene={scene} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
