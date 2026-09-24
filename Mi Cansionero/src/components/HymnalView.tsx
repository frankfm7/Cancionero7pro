import { useMemo, useState, useEffect } from 'react';
import { Song, Hymnal } from '../types';
import { songs as allSongs } from '../data/songs';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Star, Music, MoreVertical, Edit, Trash2, Download, Share2, Plus, CheckSquare, Square } from 'lucide-react';
import EditHymnalModal from './EditHymnalModal';
import AddSongModal from './AddSongModal';

export default function HymnalView({ hymnal: initialHymnal, onSelectSong, onBack }: {
  hymnal: Hymnal;
  onSelectSong: (song: Song, source?: any) => void;
  onBack: () => void;
}) {
  const { state, toggleFavorite, isFavorite, removeCustomHymnal, updateCustomHymnal, removeCustomSong } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());

  // Obtener el himnario actualizado del estado
  const hymnal = useMemo(() => {
    const customHymnal = state.customHymnals.find(h => h.id === initialHymnal.id);
    return customHymnal || initialHymnal;
  }, [initialHymnal, state.customHymnals]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-menu]')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Prevenir el comportamiento del botón atrás del navegador
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      onBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onBack]);

  const hymnalSongs = useMemo(() => {
    return [...allSongs, ...state.customSongs].filter(s => s.hymnalId === hymnal.id);
  }, [hymnal.id, state.customSongs]);

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar "${hymnal.name}"? Esta acción no se puede deshacer.`)) {
      removeCustomHymnal(hymnal.id);
      onBack();
    }
  };

  const toggleSongSelection = (songId: string) => {
    const newSelected = new Set(selectedSongs);
    if (newSelected.has(songId)) {
      newSelected.delete(songId);
    } else {
      newSelected.add(songId);
    }
    setSelectedSongs(newSelected);
  };

  const handleDeleteSelectedSongs = () => {
    if (selectedSongs.size === 0) return;
    if (confirm(`¿Estás seguro de eliminar ${selectedSongs.size} canción(es)? Esta acción no se puede deshacer.`)) {
      selectedSongs.forEach(songId => {
        removeCustomSong(songId);
      });
      setSelectedSongs(new Set());
      setSelectionMode(false);
    }
  };

  const selectAllSongs = () => {
    if (selectedSongs.size === hymnalSongs.length) {
      setSelectedSongs(new Set());
    } else {
      setSelectedSongs(new Set(hymnalSongs.map(s => s.id)));
    }
  };

  const handleExport = () => {
    const data = {
      hymnal,
      songs: hymnalSongs
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${hymnal.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const text = `${hymnal.name}\n${hymnalSongs.length} canciones\n\nCanciones:\n${hymnalSongs.map(s => `- ${s.title}`).join('\n')}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: hymnal.name,
          text: text
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Información copiada al portapapeles');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <ChevronLeft size={20} />
        </button>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
             style={{ backgroundColor: hymnal.color + '20' }}>
          {hymnal.icon}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{hymnal.name}</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {hymnalSongs.length} canciones • {hymnal.language}
          </p>
        </div>
        {/* Botón modo selección */}
        <button
          onClick={() => {
            setSelectionMode(!selectionMode);
            setSelectedSongs(new Set());
          }}
          className="p-2 rounded-lg"
          style={{ backgroundColor: selectionMode ? 'var(--accent)' : 'var(--bg-tertiary)', color: selectionMode ? 'white' : 'var(--text-primary)' }}
          title={selectionMode ? 'Cancelar selección' : 'Seleccionar canciones'}
        >
          <CheckSquare size={20} />
        </button>
        {/* Botón agregar canción */}
        {!selectionMode && (
          <button
            onClick={() => setShowAddSongModal(true)}
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
            title="Agregar canción"
          >
            <Plus size={20} />
          </button>
        )}
        {/* Menú de opciones para todos los cancioneros */}
        <div className="relative" data-menu>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <MoreVertical size={20} />
          </button>
            {showMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg overflow-hidden z-50"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowEditModal(true);
                  }}
                  className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:opacity-80"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Edit size={16} /> Editar
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleExport();
                  }}
                  className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:opacity-80"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Download size={16} /> Exportar
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleShare();
                  }}
                  className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:opacity-80"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Share2 size={16} /> Compartir
                </button>
                {hymnal.isCustom && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:opacity-80 text-red-500"
                  >
                    <Trash2 size={16} /> Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
      </div>

      {/* Selection Actions Bar */}
      {selectionMode && (
        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: 'var(--accent-light)', border: '1px solid var(--accent)' }}>
          <button
            onClick={selectAllSongs}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            {selectedSongs.size === hymnalSongs.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </button>
          <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            {selectedSongs.size} seleccionada(s)
          </span>
          <div className="flex-1" />
          {selectedSongs.size > 0 && (
            <button
              onClick={handleDeleteSelectedSongs}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
              style={{ backgroundColor: '#ef4444', color: 'white' }}
            >
              <Trash2 size={14} /> Eliminar
            </button>
          )}
        </div>
      )}

      {/* Songs List */}
      <div className="space-y-2">
        {hymnalSongs.map(song => (
          <div
            key={song.id}
            className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01]"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: selectedSongs.has(song.id) ? 'var(--accent)' : 'var(--border-color)',
              borderWidth: selectedSongs.has(song.id) ? '2px' : '1px'
            }}
          >
            {selectionMode && (
              <button
                onClick={() => toggleSongSelection(song.id)}
                className="p-1"
                style={{ color: selectedSongs.has(song.id) ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {selectedSongs.has(song.id) ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
            )}
            <button onClick={() => !selectionMode && onSelectSong(song, { type: 'hymnal', id: hymnal.id, name: hymnal.name } as any)} className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent)' }}>
                  {song.code}
                </span>
                <span className="font-medium text-sm">{song.title}</span>
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {song.artist} • {song.key} • {song.timeSignature} • {song.bpm} BPM
              </div>
            </button>
            {!selectionMode && (
              <button
                onClick={() => toggleFavorite(song.id)}
                className="p-2 rounded-lg"
                style={{ color: isFavorite(song.id) ? 'var(--gold)' : 'var(--text-muted)' }}
              >
                <Star size={18} fill={isFavorite(song.id) ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        ))}
        {hymnalSongs.length === 0 && (
          <div className="text-center py-12">
            <Music size={40} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No hay canciones en este himnario aún
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditHymnalModal
          hymnal={hymnal}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedHymnal) => {
            updateCustomHymnal(updatedHymnal);
            setShowEditModal(false);
          }}
        />
      )}

      {/* Add Song Modal */}
      {showAddSongModal && (
        <AddSongModal
          hymnal={hymnal}
          onClose={() => setShowAddSongModal(false)}
        />
      )}
    </div>
  );
}
