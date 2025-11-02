// ./src/app/scene-creation/page.tsx
import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// ↑ Замени/удали эти импорты, если у тебя другой путь/компоненты.

export const metadata = {
  title: "Create New Scene",
  description: "Scene creation workspace",
}; // ← критично закрыть объект и поставить ;

export default function SceneCreationPage() {
  // Пример: избегай дженерика с <T> перед JSX
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
            {/* твой контент */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Right panel</CardTitle>
          </CardHeader>
          <CardContent>
            {/* твой контент */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
