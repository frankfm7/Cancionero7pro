import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AppState, Setlist, SetlistSong, Hymnal, Song, Order } from '../types';
import { hymnals } from '../data/songs';

interface AppContextType {
  state: AppState;
  toggleFavorite: (songId: string) => void;
  isFavorite: (songId: string) => boolean;
  addSetlist: (name: string) => void;
  removeSetlist: (id: string) => void;
  addSongToSetlist: (setlistId: string, song: SetlistSong) => void;
  removeSongFromSetlist: (setlistId: string, songId: string) => void;
  updateSetlistSong: (setlistId: string, songId: string, updates: Partial<SetlistSong>) => void;
  reorderSetlist: (setlistId: string, songs: SetlistSong[]) => void;
  addOrder: (order: Order) => void;
  removeOrder: (id: string) => void;
  updateOrder: (order: Order) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setFontSize: (size: number) => void;
  setShowChords: (show: boolean) => void;
  setCapo: (capo: number) => void;
  updatePersonalNote: (songId: string, note: string) => void;
  addCustomHymnal: (hymnal: Hymnal) => void;
  removeCustomHymnal: (id: string) => void;
  updateCustomHymnal: (hymnal: Hymnal) => void;
  addCustomSong: (song: Song) => void;
  updateCustomSong: (song: Song) => void;
  removeCustomSong: (id: string) => void;
}

const defaultState: AppState = {
  favorites: [],
  setlists: [],
  orders: [],
  preferences: {
    theme: 'dark',
    fontSize: 18,
    showChords: true,
    capo: 0,
  },
  personalNotes: {},
  customHymnals: [],
  customSongs: [],
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Cargar canciones personalizadas desde localStorage al iniciar
  const loadCustomSongs = (): Song[] => {
    try {
      const saved = localStorage.getItem('cancionero-custom-songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const initialState = {
    ...defaultState,
    customSongs: loadCustomSongs(),
  };

  const [state, setState] = useLocalStorage<AppState>('cancionero-ruah-state', initialState);

  // Migración: asegurar que orders exista en el estado
  useEffect(() => {
    if (!state.orders) {
      setState(prev => ({ ...prev, orders: [] }));
    }
  }, [state.orders, setState]);

  const toggleFavorite = useCallback((songId: string) => {
    setState(prev => ({
      ...prev,
      favorites: prev.favorites.includes(songId)
        ? prev.favorites.filter(id => id !== songId)
        : [...prev.favorites, songId],
    }));
  }, [setState]);

  const isFavorite = useCallback((songId: string) => {
    return state.favorites.includes(songId);
  }, [state.favorites]);

  const addSetlist = useCallback((name: string) => {
    const newSetlist: Setlist = {
      id: crypto.randomUUID(),
      name,
      songs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: '',
    };
    setState(prev => ({ ...prev, setlists: [...prev.setlists, newSetlist] }));
  }, [setState]);

  const removeSetlist = useCallback((id: string) => {
    setState(prev => ({ ...prev, setlists: prev.setlists.filter(s => s.id !== id) }));
  }, [setState]);

  const addSongToSetlist = useCallback((setlistId: string, song: SetlistSong) => {
    setState(prev => ({
      ...prev,
      setlists: prev.setlists.map(s =>
        s.id === setlistId
          ? { ...s, songs: [...s.songs, song], updatedAt: new Date().toISOString() }
          : s
      ),
    }));
  }, [setState]);

  const removeSongFromSetlist = useCallback((setlistId: string, songId: string) => {
    setState(prev => ({
      ...prev,
      setlists: prev.setlists.map(s =>
        s.id === setlistId
          ? { ...s, songs: s.songs.filter(song => song.songId !== songId), updatedAt: new Date().toISOString() }
          : s
      ),
    }));
  }, [setState]);

  const updateSetlistSong = useCallback((setlistId: string, songId: string, updates: Partial<SetlistSong>) => {
    setState(prev => ({
      ...prev,
      setlists: prev.setlists.map(s =>
        s.id === setlistId
          ? {
              ...s,
              songs: s.songs.map(song =>
                song.songId === songId ? { ...song, ...updates } : song
              ),
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    }));
  }, [setState]);

  const reorderSetlist = useCallback((setlistId: string, songs: SetlistSong[]) => {
    setState(prev => ({
      ...prev,
      setlists: prev.setlists.map(s =>
        s.id === setlistId ? { ...s, songs, updatedAt: new Date().toISOString() } : s
      ),
    }));
  }, [setState]);

  const addOrder = useCallback((order: Order) => {
    setState(prev => ({ ...prev, orders: [...prev.orders, order] }));
  }, [setState]);

  const removeOrder = useCallback((id: string) => {
    setState(prev => ({ ...prev, orders: prev.orders.filter(o => o.id !== id) }));
  }, [setState]);

  const updateOrder = useCallback((order: Order) => {
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === order.id ? order : o),
    }));
  }, [setState]);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setState(prev => ({ ...prev, preferences: { ...prev.preferences, theme } }));
  }, [setState]);

  const setFontSize = useCallback((fontSize: number) => {
    setState(prev => ({ ...prev, preferences: { ...prev.preferences, fontSize } }));
  }, [setState]);

  const setShowChords = useCallback((showChords: boolean) => {
    setState(prev => ({ ...prev, preferences: { ...prev.preferences, showChords } }));
  }, [setState]);

  const setCapo = useCallback((capo: number) => {
    setState(prev => ({ ...prev, preferences: { ...prev.preferences, capo } }));
  }, [setState]);

  const updatePersonalNote = useCallback((songId: string, note: string) => {
    setState(prev => ({
      ...prev,
      personalNotes: { ...prev.personalNotes, [songId]: note },
    }));
  }, [setState]);

  const addCustomHymnal = useCallback((hymnal: Hymnal) => {
    setState(prev => ({ ...prev, customHymnals: [...prev.customHymnals, hymnal] }));
  }, [setState]);

  const removeCustomHymnal = useCallback((id: string) => {
    setState(prev => ({ ...prev, customHymnals: prev.customHymnals.filter(h => h.id !== id) }));
  }, [setState]);

  const updateCustomHymnal = useCallback((hymnal: Hymnal) => {
    setState(prev => {
      // Verificar si el himnario ya existe en customHymnals
      const exists = prev.customHymnals.some(h => h.id === hymnal.id);

      let newCustomHymnals;
      if (exists) {
        // Actualizar el himnario existente
        newCustomHymnals = prev.customHymnals.map(h => h.id === hymnal.id ? hymnal : h);
      } else {
        // Agregar el himnario (puede ser un himnario predeterminado que se está editando)
        newCustomHymnals = [...prev.customHymnals, hymnal];
      }

      // Si el prefijo de código cambió, actualizar los códigos de todas las canciones de este himnario
      const oldHymnal = prev.customHymnals.find((h: Hymnal) => h.id === hymnal.id) || hymnals.find((h: Hymnal) => h.id === hymnal.id);
      const oldPrefix = oldHymnal?.codePrefix || oldHymnal?.id.charAt(0).toUpperCase();
      const newPrefix = hymnal.codePrefix || hymnal.id.charAt(0).toUpperCase();

      let newCustomSongs = prev.customSongs;
      if (oldPrefix !== newPrefix) {
        // Actualizar los códigos de las canciones
        newCustomSongs = prev.customSongs.map(song => {
          if (song.hymnalId === hymnal.id) {
            const number = song.number || parseInt(song.code.replace(/^[A-Za-z]+/, '')) || 0;
            return {
              ...song,
              code: `${newPrefix}${number}`,
            };
          }
          return song;
        });

        // Guardar también en localStorage
        localStorage.setItem('cancionero-custom-songs', JSON.stringify(newCustomSongs));
      }

      return {
        ...prev,
        customHymnals: newCustomHymnals,
        customSongs: newCustomSongs,
      };
    });
  }, [setState]);

  const addCustomSong = useCallback((song: Song) => {
    setState(prev => {
      const newCustomSongs = [...prev.customSongs, song];
      // Guardar también en localStorage separado
      localStorage.setItem('cancionero-custom-songs', JSON.stringify(newCustomSongs));
      return { ...prev, customSongs: newCustomSongs };
    });
  }, [setState]);

  const updateCustomSong = useCallback((song: Song) => {
    setState(prev => {
      // Verificar si la canción ya existe en customSongs
      const exists = prev.customSongs.some(s => s.id === song.id);

      let newCustomSongs;
      if (exists) {
        // Actualizar la canción existente
        newCustomSongs = prev.customSongs.map(s => s.id === song.id ? song : s);
      } else {
        // Agregar la canción (puede ser una canción predeterminada que se está editando)
        newCustomSongs = [...prev.customSongs, song];
      }

      // Guardar también en localStorage separado
      localStorage.setItem('cancionero-custom-songs', JSON.stringify(newCustomSongs));

      return {
        ...prev,
        customSongs: newCustomSongs,
      };
    });
  }, [setState]);

  const removeCustomSong = useCallback((id: string) => {
    setState(prev => {
      const newCustomSongs = prev.customSongs.filter(s => s.id !== id);
      // Guardar también en localStorage separado
      localStorage.setItem('cancionero-custom-songs', JSON.stringify(newCustomSongs));
      return { ...prev, customSongs: newCustomSongs };
    });
  }, [setState]);

  const value = useMemo(() => ({
    state,
    toggleFavorite,
    isFavorite,
    addSetlist,
    removeSetlist,
    addSongToSetlist,
    removeSongFromSetlist,
    updateSetlistSong,
    reorderSetlist,
    addOrder,
    removeOrder,
    updateOrder,
    setTheme,
    setFontSize,
    setShowChords,
    setCapo,
    updatePersonalNote,
    addCustomHymnal,
    removeCustomHymnal,
    updateCustomHymnal,
    addCustomSong,
    updateCustomSong,
    removeCustomSong,
  }), [state, toggleFavorite, isFavorite, addSetlist, removeSetlist,
    addSongToSetlist, removeSongFromSetlist, updateSetlistSong, reorderSetlist,
    addOrder, removeOrder, updateOrder,
    setTheme, setFontSize, setShowChords, setCapo, updatePersonalNote,
    addCustomHymnal, removeCustomHymnal, updateCustomHymnal, addCustomSong, updateCustomSong, removeCustomSong]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
