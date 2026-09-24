import { useMemo } from 'react';
import { Song } from '../types';
import { songs as allSongs } from '../data/songs';
import { useApp } from '../context/AppContext';
import { Star, Music } from 'lucide-react';

export default function FavoritesPage({ onSelectSong }: { onSelectSong: (song: Song) => void }) {
  const { state, toggleFavorite } = useApp();

  const favoriteSongs = useMemo(() => {
    return [...allSongs, ...state.customSongs].filter(s => state.favorites.includes(s.id));
  }, [state.favorites, state.customSongs]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">⭐</span>
        <div>
          <h2 className="text-lg font-bold">Mis Favoritos</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {favoriteSongs.length} canciones
          </p>
        </div>
      </div>

      {favoriteSongs.length > 0 ? (
        <div className="space-y-2">
          {favoriteSongs.map(song => (
            <div
              key={song.id}
              className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01]"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            >
              <button onClick={() => onSelectSong(song)} className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent)' }}>
                    {song.code}
                  </span>
                  <span className="font-medium text-sm">{song.title}</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {song.artist} • {song.key} • {song.language}
                </div>
              </button>
              <button
                onClick={() => toggleFavorite(song.id)}
                className="p-2 rounded-lg"
                style={{ color: 'var(--gold)' }}
              >
                <Star size={18} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Music size={40} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aún no tienes canciones favoritas
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Marca canciones con la estrella ⭐ para verlas aquí
          </p>
        </div>
      )}
    </div>
  );
}
