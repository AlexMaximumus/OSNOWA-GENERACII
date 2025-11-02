'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Scene } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MountainSnow, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

function SceneCard({ scene, onDelete }: { scene: Scene, onDelete: (id: string) => void }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline line-clamp-1">{scene.artStyle} Style</CardTitle>
        <CardDescription>
          {scene.cameraAngle}, {scene.lightingStyle} lighting
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-4">{scene.prompt}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Created {formatDistanceToNow(new Date(scene.createdAt), { addSuffix: true })}
        </p>
        <Button variant="ghost" size="icon" onClick={() => onDelete(scene.id)} aria-label="Delete scene">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
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
      description: 'The scene has been removed from your library.',
      variant: 'destructive',
    });
  };

  if (!isClient) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-headline font-bold mb-6">Scene Library</h1>
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
      <h1 className="text-3xl font-headline font-bold mb-6">Scene Library</h1>
      {scenes.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Your library is empty.</h2>
          <p className="text-muted-foreground mt-2">Create a new scene to get started.</p>
          <Button asChild className="mt-4">
            <Link href="/scene-creation">
              <MountainSnow className="mr-2 h-4 w-4" />
              Create Scene
            </Link>
          </Button>
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
