// ./src/app/scene-creation/page.tsx
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // скорректируйте путь при необходимости

export default function SceneCreationPage() {
  // Не используйте здесь дженерики вида <T>... или приведения <Type>value
  const items = [] as Array<{ id: string; name: string }>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline font-bold mb-6">Create New Scene</h1>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Left panel</CardTitle>
          </CardHeader>
          <CardContent>
            {/* content */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Right panel</CardTitle>
          </CardHeader>
          <CardContent>
            {/* content */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
