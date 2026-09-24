import { useMemo, useState } from 'react';
import { Song, Hymnal } from '../types';
import { hymnals, songs as allSongs } from '../data/songs';
import { useApp } from '../context/AppContext';
import { Star, Search, ChevronRight, Plus, Music, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage({ onSelectSong, onSelectHymnal, onSearch, onAddHymnal }: {
  onSelectSong: (song: Song) => void;
  onSelectHymnal: (hymnal: Hymnal) => void;
  onSearch: () => void;
  onAddHymnal: () => void;
}) {
  const { state, toggleFavorite, isFavorite } = useApp();

  const allAvailableSongs = useMemo(() => {
    // Crear un mapa de canciones personalizadas por ID
    const customSongsMap = new Map(state.customSongs.map(s => [s.id, s]));

    // Combinar: usar versión personalizada si existe, sino usar predeterminada
    const combinedSongs = allSongs.map(song => customSongsMap.get(song.id) || song);

    // Agregar canciones personalizadas que no están en las predeterminadas
    const defaultSongIds = new Set(allSongs.map(s => s.id));
    const newCustomSongs = state.customSongs.filter(s => !defaultSongIds.has(s.id));

    return [...combinedSongs, ...newCustomSongs];
  }, [state.customSongs]);
  const allHymnals = useMemo(() => {
    // Combinar himnarios predeterminados con los personalizados actualizados
    const defaultHymnals = hymnals.map(h => {
      // Verificar si hay una versión personalizada de este himnario
      const customVersion = state.customHymnals.find(ch => ch.id === h.id);
      return customVersion || h;
    });
    const customOnly = state.customHymnals.filter(ch => !hymnals.find(h => h.id === ch.id));
    return [...defaultHymnals, ...customOnly];
  }, [state.customHymnals]);



  const featuredSongs = useMemo(() => {
    return allAvailableSongs.slice(0, 6);
  }, [allAvailableSongs]);

  const stats = useMemo(() => ({
    totalSongs: allAvailableSongs.length,
    totalHymnals: allHymnals.length,
    totalFavorites: state.favorites.length,
    totalSetlists: state.setlists.length,
  }), [allAvailableSongs, allHymnals, state.favorites, state.setlists]);

  return (
    <div className="space-y-6">

      {/* Cancioneros Grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>📚</span> Cancioneros
          </h2>
          <button
            onClick={onAddHymnal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            <Plus size={14} /> Nuevo
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allHymnals.map((hymnal, idx) => {
            const hymnalSongs = allAvailableSongs.filter(s => s.hymnalId === hymnal.id);
            return (
              <motion.div
                key={hymnal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl relative overflow-hidden group"
                style={{ aspectRatio: '3/4' }}
              >
                <button
                  onClick={() => onSelectHymnal(hymnal)}
                  className="w-full h-full p-4 flex flex-col justify-between text-left transition-all hover:scale-[1.03] active:scale-[0.97] relative"
                  style={{
                    background: hymnal.image
                      ? `linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${hymnal.image}) center/cover`
                      : `linear-gradient(135deg, ${hymnal.color}, ${hymnal.color}cc)`,
                    boxShadow: `0 8px 24px ${hymnal.color}66`
                  }}
                >
                  {!hymnal.image && (
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-30"
                         style={{ backgroundColor: 'white', transform: 'translate(30%, -30%)' }} />
                  )}
                  <div className="relative z-10">
                    <div className="text-5xl mb-3">{hymnal.icon}</div>
                    <div className="text-white font-bold text-lg leading-tight mb-2" style={{
                      textShadow: '1px 1px 2px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9), 1px -1px 2px rgba(0,0,0,0.9), -1px 1px 2px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.5)'
                    }}>{hymnal.name}</div>
                  </div>
                  <div className="relative z-10">
                    <div className="text-white/90 text-sm font-semibold" style={{
                      textShadow: '1px 1px 2px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9), 1px -1px 2px rgba(0,0,0,0.9), -1px 1px 2px rgba(0,0,0,0.9)'
                    }}>{hymnalSongs.length} canciones</div>
                    <div className="text-white/70 text-xs" style={{
                      textShadow: '1px 1px 2px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9), 1px -1px 2px rgba(0,0,0,0.9), -1px 1px 2px rgba(0,0,0,0.9)'
                    }}>{hymnal.language}</div>
                  </div>
                </button>
                {hymnal.isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implementar menú de opciones
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-white text-lg">⋮</span>
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Canciones Destacadas */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp size={18} style={{ color: 'var(--accent)' }} /> Destacadas
          </h2>
          <button onClick={onSearch} className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            Ver todas →
          </button>
        </div>
        <div className="space-y-2">
          {featuredSongs.map((song, idx) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-2xl border transition-all hover:scale-[1.01]"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}
            >
              <button onClick={() => onSelectSong(song)} className="flex-1 text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                     style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                  {song.code.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{song.title}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {song.artist} • {song.key} • {song.timeSignature}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(song.id); }}
                className="p-2 rounded-xl"
                style={{ color: isFavorite(song.id) ? 'var(--gold)' : 'var(--text-muted)' }}
              >
                <Star size={18} fill={isFavorite(song.id) ? 'currentColor' : 'none'} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
