import { useState, useMemo, useEffect, useRef } from 'react';
import { Song } from '../types';
import { songs as allSongs } from '../data/songs';
import { hymnals } from '../data/songs';
import { useApp } from '../context/AppContext';
import { Search, X, Star, Filter, Music, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchPage({ onSelectSong }: { onSelectSong: (song: Song) => void }) {
  const { state, toggleFavorite, isFavorite } = useApp();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterHymnal, setFilterHymnal] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const filtersRef = useRef<HTMLDivElement>(null);

  // Cerrar filtros al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

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
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    allAvailableSongs.forEach(s => s.categories.forEach(c => cats.add(c)));
    return Array.from(cats).sort();
  }, [allAvailableSongs]);

  const filteredSongs = useMemo(() => {
    if (!query && !filterHymnal && !filterLanguage && !filterCategory) return [];

    return allAvailableSongs.filter(song => {
      const queryLower = query.toLowerCase();

      // Búsqueda mejorada: busca en título, artista, código, letra y notas
      const matchesQuery = !query ||
        song.title.toLowerCase().includes(queryLower) ||
        song.artist.toLowerCase().includes(queryLower) ||
        song.code.toLowerCase().includes(queryLower) ||
        song.lyrics.toLowerCase().includes(queryLower) ||
        song.notes.toLowerCase().includes(queryLower) ||
        // También buscar en letras por idioma si existen
        (song.lyricsByLanguage && Object.values(song.lyricsByLanguage).some(lyrics =>
          lyrics.toLowerCase().includes(queryLower)
        ));

      const matchesHymnal = !filterHymnal || song.hymnalId === filterHymnal;
      const matchesLanguage = !filterLanguage || song.language.toLowerCase().includes(filterLanguage.toLowerCase());
      const matchesCategory = !filterCategory || song.categories.includes(filterCategory);

      return matchesQuery && matchesHymnal && matchesLanguage && matchesCategory;
    });
  }, [query, filterHymnal, filterLanguage, filterCategory, allAvailableSongs]);

  const languages = useMemo(() => {
    const langs = new Set<string>();
    allAvailableSongs.forEach(s => langs.add(s.language));
    return Array.from(langs).sort();
  }, [allAvailableSongs]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-xl"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold mb-1">Buscar Canciones</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Busca por título, artista, código o letra
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: showFilters ? 'var(--accent)' : 'var(--bg-tertiary)', color: showFilters ? 'white' : 'var(--text-primary)' }}
        >
          <Filter size={16} />
          Filtros
          {(filterHymnal || filterLanguage || filterCategory) && (
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: showFilters ? 'white' : 'var(--accent)' }} />
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar canciones..."
          className="w-full pl-12 pr-12 py-4 rounded-2xl border text-base font-medium"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--card-shadow)'
          }}
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <X size={16} />
          </button>
        )}
      </div>



      {/* Filters */}
      {showFilters && (
        <motion.div
          ref={filtersRef}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="rounded-2xl border p-4 space-y-3 overflow-hidden"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <div>
            <label className="text-xs font-bold mb-1.5 block uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Himnario
            </label>
            <select
              value={filterHymnal}
              onChange={e => setFilterHymnal(e.target.value)}
              className="w-full p-3 rounded-xl border text-sm"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="">Todos los himnarios</option>
              {[...hymnals, ...state.customHymnals].map(h => (
                <option key={h.id} value={h.id}>{h.icon} {h.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold mb-1.5 block uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Idioma
            </label>
            <select
              value={filterLanguage}
              onChange={e => setFilterLanguage(e.target.value)}
              className="w-full p-3 rounded-xl border text-sm"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="">Todos los idiomas</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold mb-1.5 block uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Categoría
            </label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full p-3 rounded-xl border text-sm"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="">Todas las categorías</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {(filterHymnal || filterLanguage || filterCategory) && (
            <button
              onClick={() => { setFilterHymnal(''); setFilterLanguage(''); setFilterCategory(''); }}
              className="text-sm font-semibold px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--accent)' }}
            >
              Limpiar filtros
            </button>
          )}
        </motion.div>
      )}

      {/* Results */}
      <div>
        <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
          {filteredSongs.length} resultado{filteredSongs.length !== 1 ? 's' : ''}
        </div>
        <div className="space-y-2">
          {filteredSongs.map((song, idx) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="flex items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.01]"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}
            >
              <button onClick={() => onSelectSong(song)} className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-lg font-bold"
                        style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                    {song.code}
                  </span>
                  <span className="font-bold text-base">{song.title}</span>
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {song.artist} • {song.key} • {song.timeSignature} • {song.bpm} BPM
                </div>
              </button>
              <button
                onClick={() => toggleFavorite(song.id)}
                className="p-2.5 rounded-xl"
                style={{ color: isFavorite(song.id) ? 'var(--gold)' : 'var(--text-muted)' }}
              >
                <Star size={20} fill={isFavorite(song.id) ? 'currentColor' : 'none'} />
              </button>
            </motion.div>
          ))}
        </div>
        {filteredSongs.length === 0 && (
          <div className="text-center py-12">
            <Music size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>
              No se encontraron canciones
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
