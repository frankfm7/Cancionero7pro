import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Upload, FileText, Image, Camera } from 'lucide-react';
import { Hymnal, Song } from '../types';
import { useApp } from '../context/AppContext';
import { generateSongCode, getNextSongNumber } from '../utils/songCode';
import PhotoExtractor from './PhotoExtractor';

interface AddSongModalProps {
  hymnal: Hymnal;
  onClose: () => void;
}

export default function AddSongModal({ hymnal, onClose }: AddSongModalProps) {
  const { state, addCustomSong } = useApp();
  const [mode, setMode] = useState<'select' | 'create' | 'import' | 'photo'>('select');
  const [showPhotoExtractor, setShowPhotoExtractor] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [number, setNumber] = useState<number | null>(null);
  const [key, setKey] = useState('');
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [bpm, setBpm] = useState(120);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([hymnal.language.split('/')[0]]);
  const [lyrics, setLyrics] = useState('');
  const [lyricsByLanguage, setLyricsByLanguage] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState('');
  const [currentEditLang, setCurrentEditLang] = useState<string>(hymnal.language.split('/')[0]);

  const availableLanguages = ['Castellano', 'Aymara', 'Quechua', 'Inglés', 'Portugués', 'Francés', 'Italiano', 'Alemán'];
  const isBilingual = selectedLanguages.length > 1;

  // Obtener todas las canciones del himnario actual
  const allSongs = [...state.customSongs];
  const hymnalSongs = allSongs.filter(s => s.hymnalId === hymnal.id);

  const handleCreate = () => {
    if (!title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    // Generar número automáticamente si no se proporcionó
    const songNumber = number || getNextSongNumber(hymnal.id, allSongs);
    const songCode = generateSongCode(hymnal, songNumber);

    const newSong: Song = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim() || 'Desconocido',
      code: songCode,
      number: songNumber,
      hymnalId: hymnal.id,
      key: key.trim() || 'C',
      timeSignature: timeSignature.trim() || '4/4',
      bpm: bpm || 120,
      language: selectedLanguages.join('/'),
      categories: categories.split(',').map(c => c.trim()).filter(Boolean),
      sections: [],
      lyrics: isBilingual ? (lyricsByLanguage[selectedLanguages[0]] || '') : lyrics.trim(),
      lyricsByLanguage: isBilingual ? lyricsByLanguage : undefined,
      notes: '',
    };

    // Usar el contexto para agregar la canción
    addCustomSong(newSong);
    onClose();
  };

  const handleAddLanguage = (lang: string) => {
    if (!selectedLanguages.includes(lang)) {
      const newLanguages = [...selectedLanguages, lang];
      setSelectedLanguages(newLanguages);

      // Si es el segundo idioma, migrar las letras existentes
      if (newLanguages.length === 2) {
        const newLyricsByLanguage = {
          [newLanguages[0]]: lyrics,
          [newLanguages[1]]: ''
        };
        setLyricsByLanguage(newLyricsByLanguage);
        setLyrics('');
        setCurrentEditLang(newLanguages[1]);
      }
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    if (selectedLanguages.length > 1) {
      const newLanguages = selectedLanguages.filter(l => l !== lang);
      setSelectedLanguages(newLanguages);

      // Actualizar lyricsByLanguage
      const newLyricsByLanguage = { ...lyricsByLanguage };
      delete newLyricsByLanguage[lang];
      setLyricsByLanguage(newLyricsByLanguage);

      // Si solo queda un idioma, migrar a lyrics simple
      if (newLanguages.length === 1) {
        setLyrics(newLyricsByLanguage[newLanguages[0]] || '');
        setLyricsByLanguage({});
        setCurrentEditLang(newLanguages[0]);
      } else if (currentEditLang === lang) {
        setCurrentEditLang(newLanguages[0]);
      }
    }
  };

  const handleLyricsChange = (value: string) => {
    if (isBilingual && currentEditLang) {
      setLyricsByLanguage(prev => ({
        ...prev,
        [currentEditLang]: value
      }));
    } else {
      setLyrics(value);
    }
  };

  const getCurrentLyrics = () => {
    if (isBilingual && currentEditLang) {
      return lyricsByLanguage[currentEditLang] || '';
    }
    return lyrics;
  };

  const handlePhotoExtracted = ( { title: string; artist: string; lyrics: string }) => {
    setTitle(data.title);
    setArtist(data.artist);
    setLyrics(data.lyrics);
    setShowPhotoExtractor(false);
    setMode('create');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;

      // Intentar parsear como JSON
      try {
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          // Importar múltiples canciones
          const customSongs = JSON.parse(localStorage.getItem('cancionero-custom-songs') || '[]');
          data.forEach((song: any) => {
            customSongs.push({
              ...song,
              id: song.id || `custom-${Date.now()}-${Math.random()}`,
              hymnalId: hymnal.id,
            });
          });
          localStorage.setItem('cancionero-custom-songs', JSON.stringify(customSongs));
          window.location.reload();
        } else if (data.title) {
          // Importar una sola canción
          const customSongs = JSON.parse(localStorage.getItem('cancionero-custom-songs') || '[]');
          customSongs.push({
            ...data,
            id: data.id || `custom-${Date.now()}`,
            hymnalId: hymnal.id,
          });
          localStorage.setItem('cancionero-custom-songs', JSON.stringify(customSongs));
          window.location.reload();
        }
      } catch {
        // Si no es JSON, tratar como texto plano
        const customSongs = JSON.parse(localStorage.getItem('cancionero-custom-songs') || '[]');
        customSongs.push({
          id: `custom-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Importado',
          code: `IMP${Date.now()}`,
          hymnalId: hymnal.id,
          key: 'C',
          timeSignature: '4/4',
          bpm: 120,
          language: hymnal.language.split('/')[0],
          categories: [],
          sections: [],
          lyrics: content,
          notes: '',
        });
        localStorage.setItem('cancionero-custom-songs', JSON.stringify(customSongs));
        window.location.reload();
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Agregar Canción a {hymnal.name}</h2>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <X size={18} />
          </button>
        </div>

        {mode === 'select' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setMode('create')}
              className="p-6 rounded-2xl border-2 border-dashed hover:border-solid transition-all"
              style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--accent-light)' }}
            >
              <Plus size={40} className="mx-auto mb-3" style={{ color: 'var(--accent)' }} />
              <h3 className="font-bold text-lg mb-2">Crear Canción</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Escribe la letra y acordes manualmente
              </p>
            </button>

            <button
              onClick={() => setMode('import')}
              className="p-6 rounded-2xl border-2 border-dashed hover:border-solid transition-all"
              style={{ borderColor: 'var(--gold)', backgroundColor: 'var(--gold-light)' }}
            >
              <Upload size={40} className="mx-auto mb-3" style={{ color: 'var(--gold)' }} />
              <h3 className="font-bold text-lg mb-2">Importar Canción</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Desde archivo JSON, TXT o PDF
              </p>
            </button>

            <button
              onClick={() => setShowPhotoExtractor(true)}
              className="p-6 rounded-2xl border-2 border-dashed hover:border-solid transition-all"
              style={{ borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
            >
              <Camera size={40} className="mx-auto mb-3" style={{ color: '#22c55e' }} />
              <h3 className="font-bold text-lg mb-2">Extraer de Foto</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Desde imagen o captura de pantalla
              </p>
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Título *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                placeholder="Nombre de la canción"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-2 block">Artista</label>
                <input
                  value={artist}
                  onChange={e => setArtist(e.target.value)}
                  className="w-full p-3 rounded-xl border"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="Nombre del artista"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Número (opcional)</label>
                <input
                  type="number"
                  value={number || ''}
                  onChange={e => setNumber(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-3 rounded-xl border"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="Auto"
                  min="1"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Código: {hymnal.codePrefix || hymnal.id.charAt(0).toUpperCase()}{number || getNextSongNumber(hymnal.id, allSongs)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-semibold mb-2 block">Tono</label>
                <input
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  className="w-full p-3 rounded-xl border"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="Ej: C, Am"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Compás</label>
                <input
                  value={timeSignature}
                  onChange={e => setTimeSignature(e.target.value)}
                  className="w-full p-3 rounded-xl border"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="Ej: 4/4"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">BPM</label>
                <input
                  type="number"
                  value={bpm}
                  onChange={e => setBpm(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="120"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Categorías (separadas por coma)</label>
              <input
                value={categories}
                onChange={e => setCategories(e.target.value)}
                className="w-full p-3 rounded-xl border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                placeholder="Ej: Adoración, Alabanza"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Idiomas</label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {selectedLanguages.map(lang => (
                    <div key={lang} className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium"
                         style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                      <span>{lang}</span>
                      {selectedLanguages.length > 1 && (
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

                <select
                  onChange={e => {
                    if (e.target.value) {
                      handleAddLanguage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full p-3 rounded-xl border text-sm"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <option value="">+ Agregar idioma...</option>
                  {availableLanguages.filter(l => !selectedLanguages.includes(l)).map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Letra y Acordes</label>

              {/* Botones de idioma para canciones bilingües */}
              {isBilingual && (
                <div className="flex gap-2 mb-3">
                  {selectedLanguages.map(lang => (
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

              <textarea
                value={getCurrentLyrics()}
                onChange={e => handleLyricsChange(e.target.value)}
                className="w-full p-3 rounded-xl border font-mono resize-none"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  minHeight: '300px',
                  lineHeight: '1.8'
                }}
                placeholder={`VERSO 1
//G            Em          C          D
Grande es el Señor y digno de loar
//G            Em          C          D
más grande que todo lo que Él ha creado

CORO
//C          D         Em         G
Grande es el Señor y digno de loar`}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMode('select')}
                className="flex-1 py-3 rounded-xl font-medium"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                Volver
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-3 rounded-xl font-bold"
                style={{ backgroundColor: 'var(--accent)', color: 'white' }}
              >
                Crear Canción
              </button>
            </div>
          </div>
        )}

        {mode === 'import' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl border-2 border-dashed text-center"
                 style={{ borderColor: 'var(--border-color)' }}>
              <Upload size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Selecciona un archivo para importar
              </p>
              <input
                type="file"
                accept=".json,.txt,.pdf"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="inline-block px-6 py-3 rounded-xl font-medium cursor-pointer"
                style={{ backgroundColor: 'var(--accent)', color: 'white' }}
              >
                Seleccionar Archivo
              </label>
              <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                Formatos soportados: JSON, TXT, PDF
              </p>
            </div>

            <button
              onClick={() => setMode('select')}
              className="w-full py-3 rounded-xl font-medium"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              Volver
            </button>
          </div>
        )}
      </motion.div>

      {showPhotoExtractor && (
        <PhotoExtractor
          onClose={() => setShowPhotoExtractor(false)}
          onExtract={handlePhotoExtracted}
        />
      )}
    </motion.div>
  );
}
