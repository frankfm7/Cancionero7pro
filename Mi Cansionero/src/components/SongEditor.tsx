import { useState, useEffect, useMemo } from 'react';
import { Song } from '../types';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Save, Trash2, Plus } from 'lucide-react';
import { hymnals } from '../data/songs';

export default function SongEditor({ song: initialSong, onBack }: { song: Song; onBack: () => void }) {
  const { state, updateCustomSong } = useApp();

  // Obtener la canción actualizada del estado
  const song = useMemo(() => {
    const customSong = state.customSongs.find(s => s.id === initialSong.id);
    return customSong || initialSong;
  }, [initialSong, state.customSongs]);

  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [number, setNumber] = useState(song.number || 0);
  const [key, setKey] = useState(song.key);
  const [timeSignature, setTimeSignature] = useState(song.timeSignature);
  const [bpm, setBpm] = useState(song.bpm);
  const [languages, setLanguages] = useState<string[]>(song.language.split('/').map((l: string) => l.trim()).filter(Boolean));
  const [lyrics, setLyrics] = useState(song.lyrics);
  const [lyricsByLanguage, setLyricsByLanguage] = useState<Record<string, string>>(song.lyricsByLanguage || {});
  const [categories, setCategories] = useState(song.categories.join(', '));
  const [currentEditLang, setCurrentEditLang] = useState<string>('');
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');

  const allHymnals = [...hymnals, ...state.customHymnals];
  const availableLanguages = ['Castellano', 'Aymara', 'Quechua', 'Inglés', 'Portugués', 'Francés', 'Italiano', 'Alemán'];
  const isBilingual = languages.length > 1;

  useEffect(() => {
    if (languages.length > 0 && !currentEditLang) {
      setCurrentEditLang(languages[0]);
    }
  }, [languages, currentEditLang]);

  const handleSave = () => {
    // Obtener el himnario para generar el código
    const hymnal = allHymnals.find(h => h.id === song.hymnalId);
    const prefix = hymnal?.codePrefix || hymnal?.id.charAt(0).toUpperCase() || 'X';
    const code = `${prefix}${number}`;

    const updatedSong: Song = {
      ...song,
      title,
      artist,
      code,
      number,
      key,
      timeSignature,
      bpm,
      language: languages.join('/'),
      lyrics: languages.length === 1 ? lyrics : (lyricsByLanguage[languages[0]] || ''),
      lyricsByLanguage: languages.length > 1 ? lyricsByLanguage : undefined,
      categories: categories.split(',').map((c: string) => c.trim()).filter(Boolean),
    };

    updateCustomSong(updatedSong);
    onBack();
  };

  const handleLyricsChange = (value: string) => {
    if (isBilingual && currentEditLang) {
      setLyricsByLanguage(prev => ({
        ...prev,
        [currentEditLang]: value
      }));
    } else if (languages.length === 1) {
      setLyrics(value);
    }
  };

  const getCurrentLyrics = () => {
    if (isBilingual && currentEditLang) {
      return lyricsByLanguage[currentEditLang] || '';
    }
    if (languages.length === 1) {
      return lyrics;
    }
    return '';
  };

  const handleAddLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage)) {
      const updatedLanguages = [...languages, newLanguage];
      setLanguages(updatedLanguages);

      // Si es el segundo idioma, migrar las letras existentes
      if (updatedLanguages.length === 2) {
        const newLyricsByLanguage = {
          [updatedLanguages[0]]: lyrics,
          [updatedLanguages[1]]: ''
        };
        setLyricsByLanguage(newLyricsByLanguage);
        setLyrics('');
      }

      setNewLanguage('');
      setShowAddLanguage(false);
      setCurrentEditLang(newLanguage);
    }
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    if (languages.length > 1) {
      const updatedLanguages = languages.filter(l => l !== langToRemove);
      setLanguages(updatedLanguages);

      // Actualizar lyricsByLanguage
      const newLyricsByLanguage = { ...lyricsByLanguage };
      delete newLyricsByLanguage[langToRemove];
      setLyricsByLanguage(newLyricsByLanguage);

      // Si solo queda un idioma, migrar a lyrics simple
      if (updatedLanguages.length === 1) {
        setLyrics(newLyricsByLanguage[updatedLanguages[0]] || '');
        setLyricsByLanguage({});
        setCurrentEditLang('');
      } else if (currentEditLang === langToRemove) {
        setCurrentEditLang(updatedLanguages[0]);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold flex-1">Editar Canción</h1>
        <button onClick={handleSave}
                className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
          <Save size={16} /> Guardar
        </button>
      </div>

      <div className="rounded-2xl border p-4 space-y-4"
           style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Título</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
                 className="w-full p-3 rounded-xl border text-base font-semibold"
                 style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
        </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Artista</label>
              <input value={artist} onChange={e => setArtist(e.target.value)}
                     className="w-full p-3 rounded-xl border text-sm"
                     style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Número de Canción</label>
              <input
                type="number"
                value={number}
                onChange={e => setNumber(Number(e.target.value))}
                min="1"
                className="w-full p-3 rounded-xl border text-sm"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                placeholder="Ej: 1, 2, 3..."
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Código: {allHymnals.find(h => h.id === song.hymnalId)?.codePrefix || 'X'}{number}
              </p>
            </div>
          </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Tonalidad</label>
            <input value={key} onChange={e => setKey(e.target.value)}
                   className="w-full p-3 rounded-xl border text-sm"
                   style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Compás</label>
            <input value={timeSignature} onChange={e => setTimeSignature(e.target.value)}
                   className="w-full p-3 rounded-xl border text-sm"
                   style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>BPM</label>
            <input type="number" value={bpm} onChange={e => setBpm(Number(e.target.value))}
                   className="w-full p-3 rounded-xl border text-sm"
                   style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Idiomas</label>
          <div className="space-y-2">
            {/* Idiomas actuales */}
            <div className="flex flex-wrap gap-2">
              {languages.map((lang: string) => (
                <div key={lang} className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium"
                     style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                  <span>{lang}</span>
                  {languages.length > 1 && (
                    <button
                      onClick={() => handleRemoveLanguage(lang)}
                      className="ml-1 hover:opacity-70"
                      title="Eliminar idioma"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Botón agregar idioma */}
            {!showAddLanguage ? (
              <button
                onClick={() => setShowAddLanguage(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                <Plus size={14} /> Agregar idioma
              </button>
            ) : (
              <div className="flex gap-2">
                <select
                  value={newLanguage}
                  onChange={e => setNewLanguage(e.target.value)}
                  className="flex-1 p-2 rounded-xl border text-sm"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <option value="">Seleccionar idioma...</option>
                  {availableLanguages.filter(l => !languages.includes(l)).map((lang: string) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddLanguage}
                  disabled={!newLanguage}
                  className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                >
                  Agregar
                </button>
                <button
                  onClick={() => { setShowAddLanguage(false); setNewLanguage(''); }}
                  className="px-4 py-2 rounded-xl text-sm"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Categorías (separadas por coma)
          </label>
          <input value={categories} onChange={e => setCategories(e.target.value)}
                 className="w-full p-3 rounded-xl border text-sm"
                 style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
        </div>

        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Letra y Acordes
          </label>

          {/* Botones de idioma para canciones con múltiples idiomas */}
          {languages.length > 1 && (
            <div className="flex gap-2 mb-3">
              {languages.map((lang: string) => (
                <button
                  key={lang}
                  onClick={() => setCurrentEditLang(lang)}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    backgroundColor: currentEditLang === lang ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: currentEditLang === lang ? 'white' : 'var(--text-primary)',
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}

          <div className="rounded-xl p-3 mb-2" style={{ backgroundColor: 'var(--accent-light)', border: '1px solid var(--accent)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>
              📝 Formato de edición:
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Escribe los acordes con <code className="font-bold">//</code> al inicio, luego la letra debajo:
            </p>
            <pre className="text-xs mt-2 font-mono" style={{ color: 'var(--accent)' }}>
{`//Am           F             Em       Am
Grande y fuerte es nuestro Dios`}
            </pre>
          </div>
          <textarea
            key={currentEditLang}
            value={getCurrentLyrics()}
            onChange={e => handleLyricsChange(e.target.value)}
            className="w-full p-3 rounded-xl border text-sm font-mono resize-none"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              minHeight: '400px',
              lineHeight: '2',
              fontSize: '14px'
            }}
            placeholder={`VERSO 1
//Am           F             Em       Am
Escribe aquí la letra de la canción
//Am           F             Em       Am
con los acordes alineados arriba

CORO
//F              G           Am
La letra del coro va aquí
//F              G           Am
con acordes en la línea de arriba`}
          />
        </div>
      </div>
    </div>
  );
}
