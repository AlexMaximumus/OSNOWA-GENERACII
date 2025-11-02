'use client';

import { useLocalStorage } from './use-local-storage';
import { useToast } from './use-toast';

export type FavoriteSettings = {
  artStyle: string;
  cameraAngle: string;
  lightingStyle: string;
  camera: string;
  filmType: string;
};

const defaultSettings: FavoriteSettings = {
  artStyle: 'none',
  cameraAngle: 'none',
  lightingStyle: 'none',
  camera: 'none',
  filmType: 'none',
};

export function useFavoriteSettings() {
  const [favoriteSettings, setFavoriteSettings] = useLocalStorage<FavoriteSettings>('favorite-settings', defaultSettings);
  const { toast } = useToast();

  const saveFavoriteSettings = (settings: Partial<FavoriteSettings>) => {
    const newSettings: FavoriteSettings = {
      artStyle: settings.artStyle || 'none',
      cameraAngle: settings.cameraAngle || 'none',
      lightingStyle: settings.lightingStyle || 'none',
      camera: settings.camera || 'none',
      filmType: settings.filmType || 'none',
    };
    setFavoriteSettings(newSettings);
    toast({
      title: 'Favorite Settings Saved',
      description: 'Your preferred settings have been saved and will be applied automatically.',
    });
  };

  const resetFavoriteSettings = () => {
    setFavoriteSettings(defaultSettings);
    toast({
      title: 'Favorite Settings Reset',
      description: 'Your favorite settings have been cleared.',
    });
    // We might need to reload or imperatively update forms on other pages
    // For now, we just reset the storage. The forms will get the new defaults on next load.
    window.location.reload(); // Simple way to force forms to re-read defaults
  };

  return { favoriteSettings, saveFavoriteSettings, resetFavoriteSettings };
}
