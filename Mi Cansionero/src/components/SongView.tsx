import { useState, useMemo, useEffect, useRef } from 'react';
import { Song } from '../types';
import { useApp } from '../context/AppContext';
import { transposeLyrics } from '../utils/chords';
import { Star, ChevronLeft, Edit3, Copy, Share2, ListPlus, Settings, RotateCcw, Play, Pause, MoreVertical, Trash2, ArrowRightLeft } from 'lucide-react';
import { hymnals } from '../data/songs';
import { motion, AnimatePresence } from 'framer-motion';

export default function SongView({ song: initialSong, onBack, onEdit, songSource }: { song: Song; onBack: () => void; onEdit: () => void; songSource?: { type: 'list' | 'order' | 'hymnal' | 'search' | 'home', id?: string, name?: string } | null }) {
  const { state, toggleFavorite, isFavorite, setFontSize, setShowChords, setCapo, updatePersonalNote, addSongToSetlist, updateCustomSong, removeCustomSong } = useApp();
  const [transposition, setTransposition] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showAddToList, setShowAddToList] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [activeSection, setActiveSection] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<string>(initialSong.language.split('/')[0]);
  const [activeKey, setActiveKey] = useState<string | null>(null); // null = nota original
  const [showKeySelector, setShowKeySelector] = useState(false);
  const [showEditKeysModal, setShowEditKeysModal] = useState(false);
  const [editingKeySlot, setEditingKeySlot] = useState<1 | 2 | null>(null);
  const [isMinor, setIsMinor] = useState(false); // Para seleccionar entre mayor/menor
  const [showMoveModal, setShowMoveModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Obtener la canción actualizada del estado
  const song = useMemo(() => {
    const customSong = state.customSongs.find(s => s.id === initialSong.id);
    return customSong || initialSong;
  }, [initialSong, state.customSongs]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-menu]')) {
        setShowActionsMenu(false);
      }
      if (!target.closest('.key-selector-container')) {
        setShowKeySelector(false);
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

  const { preferences } = state;
  const hymnal = [...hymnals, ...state.customHymnals].find(h => h.id === song.hymnalId);

  const transposedLyrics = useMemo(() => {
    // Usar las letras del idioma seleccionado si existen
    let lyrics = song.lyricsByLanguage?.[currentLanguage] || song.lyrics;
    if (preferences.capo > 0) lyrics = transposeLyrics(lyrics, -preferences.capo);
    if (transposition !== 0) lyrics = transposeLyrics(lyrics, transposition);
    return lyrics;
  }, [song.lyrics, song.lyricsByLanguage, currentLanguage, transposition, preferences.capo]);

  const currentKey = useMemo(() => {
    if (transposition === 0) return song.key;
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const idx = notes.indexOf(song.key);
    if (idx === -1) return song.key;
    return notes[((idx + transposition) % 12 + 12) % 12];
  }, [song.key, transposition]);

  const sections = useMemo(() => {
    const lines = transposedLyrics.split('\n');
    const sectionList: { id: string; label: string; type: string }[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      const sectionMatch = trimmed.match(/^(VERSO|CORO|PUENTE|INTRO|FINAL|PRE-CORO|PRE CORO|OUTRO|BRIDGE)\s*(\d*)/i);
      if (sectionMatch && !trimmed.includes('//')) {
        const type = sectionMatch[1].toUpperCase();
        const num = sectionMatch[2] || '';
        const id = `${type}${num}`.toLowerCase();
        const label = num ? `${type.charAt(0)}${num}` : type.charAt(0);
        sectionList.push({ id, label: label.toUpperCase(), type });
      }
    });

    return sectionList;
  }, [transposedLyrics]);

  // Auto-scroll con contenedor interno
  useEffect(() => {
    if (isAutoScrolling && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      scrollIntervalRef.current = window.setInterval(() => {
        container.scrollTop += scrollSpeed / 20;
      }, 50);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isAutoScrolling, scrollSpeed]);

  const scrollToSection = (sectionId: string) => {
    if (scrollContainerRef.current) {
      const element = scrollContainerRef.current.querySelector(`[data-section="${sectionId}"]`);
      if (element) {
        const container = scrollContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const elementRect = (element as HTMLElement).getBoundingClientRect();

        // Calcular la posición relativa al contenedor
        const relativeTop = elementRect.top - containerRect.top + container.scrollTop;

        // Offset para compensar la navegación sticky de secciones (aproximadamente 60px)
        const offset = 80;

        // Pausar auto-scroll temporalmente
        const wasAutoScrolling = isAutoScrolling;
        if (isAutoScrolling) {
          setIsAutoScrolling(false);
        }

        container.scrollTo({
          top: relativeTop - offset,
          behavior: 'smooth'
        });

        setActiveSection(sectionId);

        // Reanudar auto-scroll después de 2 segundos si estaba activo
        if (wasAutoScrolling) {
          setTimeout(() => {
            setIsAutoScrolling(true);
          }, 2000);
        }
      }
    }
  };

  const toggleAutoScroll = () => {
    setIsAutoScrolling(!isAutoScrolling);
  };

  const handleSelectOptionalKey = (slot: 1 | 2, note: string) => {
    const updatedSong = { ...song };
    const fullNote = isMinor ? note + 'm' : note;
    if (slot === 1) {
      updatedSong.optionalKey1 = fullNote;
    } else {
      updatedSong.optionalKey2 = fullNote;
    }
    updateCustomSong(updatedSong);
    setShowEditKeysModal(false);
    setEditingKeySlot(null);
    setIsMinor(false);
  };

  const handleSelectActiveKey = (key: string | null) => {
    setActiveKey(key);
    setShowKeySelector(false);

    if (key === null) {
      // Volver a nota original
      setTransposition(0);
    } else {
      // Extraer la nota base (sin 'm' si es menor)
      const baseKey = key.replace(/m$/, '');
      const baseOriginalKey = song.key.replace(/m$/, '');

      // Calcular transposición
      const originalIndex = allNotes.indexOf(baseOriginalKey);
      const newIndex = allNotes.indexOf(baseKey);
      if (originalIndex !== -1 && newIndex !== -1) {
        const semitones = newIndex - originalIndex;
        setTransposition(semitones);
      }
    }
  };

  const copyLyrics = () => {
    const cleanLyrics = transposedLyrics.replace(/\/\/[^\n]*\n/g, '').replace(/\n{3,}/g, '\n\n').trim();
    navigator.clipboard.writeText(cleanLyrics);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const shareSong = () => {
    const text = `${song.title} - ${song.artist}\n\n${transposedLyrics.replace(/\/\/[^\n]*\n/g, '').trim()}`;
    if (navigator.share) {
      navigator.share({ title: song.title, text });
    } else {
      navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleDeleteSong = () => {
    if (confirm(`¿Estás seguro de eliminar "${song.title}"? Esta acción no se puede deshacer.`)) {
      removeCustomSong(song.id);
      onBack();
    }
  };

  const handleMoveToHymnal = (hymnalId: string) => {
    const updatedSong = { ...song, hymnalId };
    updateCustomSong(updatedSong);
    setShowMoveModal(false);
    onBack();
  };

  const renderLyrics = () => {
    const lines = transposedLyrics.split('\n');
    const elements: JSX.Element[] = [];
    let lineIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed === '') {
        elements.push(<div key={lineIndex++} className="h-4" />);
        continue;
      }

      const sectionMatch = trimmed.match(/^(VERSO|CORO|PUENTE|INTRO|FINAL|PRE-CORO|PRE CORO|OUTRO|BRIDGE)\s*(\d*)/i);
      if (sectionMatch && !trimmed.includes('//')) {
        const type = sectionMatch[1].toUpperCase();
        const num = sectionMatch[2] || '';
        const sectionId = `${type}${num}`.toLowerCase();

        const sectionColors: Record<string, string> = {
          'VERSO': '#7c3aed', 'CORO': '#f59e0b', 'PUENTE': '#059669',
          'INTRO': '#6366f1', 'FINAL': '#ef4444', 'PRE-CORO': '#ec4899',
          'PRE CORO': '#ec4899', 'OUTRO': '#0891b2', 'BRIDGE': '#059669',
        };
        const color = sectionColors[type] || 'var(--accent)';

        elements.push(
          <div
            key={lineIndex++}
            data-section={sectionId}
            className="mt-8 mb-3"
          >
            <span className="text-sm font-black uppercase tracking-widest px-3 py-1.5 rounded-lg inline-block"
                  style={{
                    color: activeSection === sectionId ? 'white' : color,
                    backgroundColor: activeSection === sectionId ? color : color + '20',
                    transition: 'all 0.3s ease'
                  }}>
              {trimmed}
            </span>
          </div>
        );
        continue;
      }

      if (trimmed.startsWith('//')) {
        const chordLine = trimmed.substring(2).trim();
        if (i + 1 < lines.length && lines[i + 1].trim() !== '' && !lines[i + 1].trim().startsWith('//')) {
          const lyricLine = lines[i + 1];
          i++;

          elements.push(
            <div key={lineIndex++} className="mb-4">
              {preferences.showChords && (
                <div className="font-mono text-sm mb-1 whitespace-pre overflow-x-auto"
                     style={{ color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.05em' }}>
                  {chordLine}
                </div>
              )}
              <div className="font-lyrics leading-relaxed whitespace-pre-wrap"
                   style={{ fontSize: `${preferences.fontSize}px` }}>
                {lyricLine}
              </div>
            </div>
          );
        } else {
          elements.push(
            <div key={lineIndex++} className="mb-2">
              {preferences.showChords && (
                <div className="font-mono text-sm whitespace-pre overflow-x-auto"
                     style={{ color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.05em' }}>
                  {chordLine}
                </div>
              )}
            </div>
          );
        }
        continue;
      }

      elements.push(
        <div key={lineIndex++} className="mb-4">
          <div className="font-lyrics leading-relaxed whitespace-pre-wrap"
               style={{ fontSize: `${preferences.fontSize}px` }}>
            {line}
          </div>
        </div>
      );
    }

    return elements;
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header Compacto */}
      <div className="flex-shrink-0 flex items-center gap-2 mb-2">
        <button onClick={onBack} className="p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <ChevronLeft size={18} />
        </button>
        {songSource && (songSource.type === 'list' || songSource.type === 'order') && (
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            ← Volver a {songSource.type === 'list' ? 'lista' : 'orden'}
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate">{song.title}</h1>
          <div className="flex items-center gap-2 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
            <span>{song.artist}</span>
            <span>•</span>
            {/* 3 Botones de tono */}
            <div className="flex items-center gap-1">
              {/* Botón 1: Nota original */}
              <button
                onClick={() => handleSelectActiveKey(null)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  activeKey === null ? 'ring-2 ring-offset-1 ring-purple-500' : ''
                }`}
                style={{
                  backgroundColor: activeKey === null ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: activeKey === null ? 'white' : 'var(--text-secondary)'
                }}
                title="Tono original"
              >
                {song.key}
              </button>

              {/* Botón 2: Nota opcional 1 */}
              {song.optionalKey1 && (
                <button
                  onClick={() => handleSelectActiveKey(song.optionalKey1!)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                    activeKey === song.optionalKey1 ? 'ring-2 ring-offset-1 ring-yellow-500' : ''
                  }`}
                  style={{
                    backgroundColor: activeKey === song.optionalKey1 ? 'var(--gold)' : 'var(--bg-tertiary)',
                    color: activeKey === song.optionalKey1 ? 'white' : 'var(--text-secondary)'
                  }}
                  title={`Nota opcional 1: ${song.optionalKey1}`}
                >
                  {song.optionalKey1}
                </button>
              )}

              {/* Botón 3: Nota opcional 2 */}
              {song.optionalKey2 && (
                <button
                  onClick={() => handleSelectActiveKey(song.optionalKey2!)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                    activeKey === song.optionalKey2 ? 'ring-2 ring-offset-1 ring-yellow-500' : ''
                  }`}
                  style={{
                    backgroundColor: activeKey === song.optionalKey2 ? 'var(--gold)' : 'var(--bg-tertiary)',
                    color: activeKey === song.optionalKey2 ? 'white' : 'var(--text-secondary)'
                  }}
                  title={`Nota opcional 2: ${song.optionalKey2}`}
                >
                  {song.optionalKey2}
                </button>
              )}

              {/* Botón pequeño para editar notas opcionales */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditKeysModal(true);
                }}
                className="p-1 rounded hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
                title="Editar notas opcionales"
              >
                <MoreVertical size={12} />
              </button>
            </div>
            <span>{song.timeSignature}</span>
            <span>{song.bpm} BPM</span>
          </div>
        </div>
        <button onClick={() => toggleFavorite(song.id)} className="p-2 rounded-xl"
                style={{ color: isFavorite(song.id) ? 'var(--gold)' : 'var(--text-muted)' }}>
          <Star size={20} fill={isFavorite(song.id) ? 'currentColor' : 'none'} />
        </button>
        {song.lyricsByLanguage && Object.keys(song.lyricsByLanguage).length > 1 && (
          <button
            onClick={() => {
              const languages = Object.keys(song.lyricsByLanguage!);
              const currentIndex = languages.indexOf(currentLanguage);
              const nextIndex = (currentIndex + 1) % languages.length;
              setCurrentLanguage(languages[nextIndex]);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            {currentLanguage}
          </button>
        )}
        <button onClick={() => setShowConfig(!showConfig)} className="p-2 rounded-xl"
                style={{ backgroundColor: showConfig ? 'var(--accent-light)' : 'var(--bg-tertiary)', color: showConfig ? 'var(--accent)' : 'var(--text-primary)' }}>
          <Settings size={18} />
        </button>
        {/* Menú de tres puntos */}
        <div className="relative" data-menu>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActionsMenu(!showActionsMenu);
            }}
            className="p-2 rounded-xl"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <MoreVertical size={18} />
          </button>
          {showActionsMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-44 rounded-xl shadow-lg overflow-hidden z-50"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
            >
              <button
                onClick={() => { onEdit(); setShowActionsMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:opacity-80"
                style={{ color: 'var(--text-primary)' }}
              >
                <Edit3 size={14} /> Editar
              </button>
              <button
                onClick={() => { copyLyrics(); setShowActionsMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:opacity-80"
                style={{ color: 'var(--text-primary)' }}
              >
                <Copy size={14} /> {showCopied ? '¡Copiado!' : 'Copiar Letra'}
              </button>
              <button
                onClick={() => { shareSong(); setShowActionsMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:opacity-80"
                style={{ color: 'var(--text-primary)' }}
              >
                <Share2 size={14} /> Compartir
              </button>
              <button
                onClick={() => { setShowAddToList(true); setShowActionsMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                <ListPlus size={14} /> Agregar a Lista
              </button>
              <button
                onClick={() => { handleDeleteSong(); setShowActionsMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:opacity-80"
                style={{ color: '#ef4444' }}
              >
                <Trash2 size={14} /> Eliminar
              </button>
              <button
                onClick={() => { setShowMoveModal(true); setShowActionsMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:opacity-80"
                style={{ color: 'var(--text-primary)' }}
              >
                <ArrowRightLeft size={14} /> Mover a otro cancionero
              </button>
            </div>
          )}
        </div>
      </div>



      {/* Configuration Panel */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-hidden mb-4"
          >
            <div className="rounded-2xl border p-4 space-y-4"
                 style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Transposición</span>
                  {transposition !== 0 && (
                    <button onClick={() => setTransposition(0)} className="text-xs flex items-center gap-1"
                            style={{ color: 'var(--accent)' }}>
                      <RotateCcw size={12} /> Original
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setTransposition(t => t - 1)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                          style={{ backgroundColor: 'var(--bg-tertiary)' }}>−</button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                      {transposition > 0 ? `+${transposition}` : transposition}
                    </span>
                    <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>semitonos</span>
                  </div>
                  <button onClick={() => setTransposition(t => t + 1)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                          style={{ backgroundColor: 'var(--bg-tertiary)' }}>+</button>
                </div>
              </div>

              <div>
                <span className="text-sm font-semibold mb-2 block">Capo de Guitarra</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCapo(Math.max(0, preferences.capo - 1))}
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                          style={{ backgroundColor: 'var(--bg-tertiary)' }}>−</button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold">{preferences.capo > 0 ? `${preferences.capo}°` : '—'}</span>
                    <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>traste</span>
                  </div>
                  <button onClick={() => setCapo(Math.min(12, preferences.capo + 1))}
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                          style={{ backgroundColor: 'var(--bg-tertiary)' }}>+</button>
                </div>
              </div>

              <div>
                <span className="text-sm font-semibold mb-2 block">Tamaño de Letra</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs">A</span>
                  <input type="range" min="14" max="32" value={preferences.fontSize}
                         onChange={e => setFontSize(Number(e.target.value))}
                         className="flex-1 accent-purple-600" />
                  <span className="text-xl font-bold">A</span>
                  <span className="text-xs w-10 text-right">{preferences.fontSize}px</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Mostrar Acordes</span>
                <button
                  onClick={() => setShowChords(!preferences.showChords)}
                  className="w-12 h-7 rounded-full transition-all relative"
                  style={{ backgroundColor: preferences.showChords ? 'var(--accent)' : 'var(--bg-tertiary)' }}
                >
                  <div className="w-5 h-5 rounded-full bg-white absolute top-1 transition-all"
                       style={{ left: preferences.showChords ? '26px' : '4px' }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Lyrics Container - Scrollable */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto rounded-2xl border"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}
      >
        {/* Section Navigation - Sticky dentro del contenedor scroll */}
        {sections.length > 0 && (
          <div className="sticky top-0 z-20 py-2 px-3 border-b shadow-sm"
               style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <div className="flex gap-1.5 overflow-x-auto">
              {sections.map((section, idx) => {
                const sectionColors: Record<string, string> = {
                  'VERSO': '#7c3aed', 'CORO': '#f59e0b', 'PUENTE': '#059669',
                  'INTRO': '#6366f1', 'FINAL': '#ef4444', 'PRE-CORO': '#ec4899',
                  'PRE CORO': '#ec4899', 'OUTRO': '#0891b2', 'BRIDGE': '#059669',
                };
                const color = sectionColors[section.type] || 'var(--accent)';

                return (
                  <button
                    key={idx}
                    onClick={() => scrollToSection(section.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                    style={{
                      backgroundColor: activeSection === section.id ? color : color + '20',
                      color: activeSection === section.id ? 'white' : color
                    }}
                  >
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-5 md:p-8">
          {renderLyrics()}
        </div>
      </div>

      {/* Auto-Scroll Floating Button */}
      <div className="fixed bottom-24 right-4 z-30 flex flex-col items-center gap-2">
        {isAutoScrolling && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="rounded-xl p-2 flex flex-col items-center"
            style={{
              backgroundColor: 'rgba(0,0,0,0.15)',
              backdropFilter: 'blur(5px)',
            }}
          >
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={scrollSpeed}
              onChange={e => setScrollSpeed(Number(e.target.value))}
              className="accent-purple-400"
              style={{
                writingMode: 'vertical-lr' as any,
                direction: 'rtl',
                height: '80px',
                width: '24px'
              }}
            />
            <div className="text-[10px] font-bold mt-1 text-white/90 drop-shadow-lg">
              {scrollSpeed}
            </div>
          </motion.div>
        )}

        <button
          onClick={toggleAutoScroll}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 hover:scale-105"
          style={{
            backgroundColor: isAutoScrolling ? 'rgba(239,68,68,0.85)' : 'rgba(124,58,237,0.85)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            boxShadow: `0 4px 16px ${isAutoScrolling ? 'rgba(239,68,68,0.3)' : 'rgba(124,58,237,0.3)'}`
          }}
        >
          {isAutoScrolling ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
      </div>

      {/* Add to List Modal */}
      <AnimatePresence>
        {showAddToList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowAddToList(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-5"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <h3 className="font-bold text-lg mb-3">Agregar a Lista</h3>
              {state.setlists.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  No tienes listas
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {state.setlists.map(setlist => (
                    <button
                      key={setlist.id}
                      onClick={() => {
                        addSongToSetlist(setlist.id, {
                          songId: song.id,
                          transposition: 0,
                          notes: '',
                          order: setlist.songs.length,
                        });
                        setShowAddToList(false);
                      }}
                      className="w-full text-left p-3 rounded-xl border"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <div className="font-medium text-sm">{setlist.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {setlist.songs.length} canciones
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Optional Keys Modal */}
      <AnimatePresence>
        {showEditKeysModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => {
              setShowEditKeysModal(false);
              setEditingKeySlot(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <h3 className="font-bold text-lg mb-4">Editar Notas Opcionales</h3>

              {!editingKeySlot ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Nota Opcional 1</span>
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--gold-light)', color: 'var(--gold)' }}>
                        {song.optionalKey1 || 'No configurada'}
                      </span>
                    </div>
                    <button
                      onClick={() => setEditingKeySlot(1)}
                      className="w-full py-2 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                    >
                      {song.optionalKey1 ? 'Cambiar nota' : 'Configurar nota'}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Nota Opcional 2</span>
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--gold-light)', color: 'var(--gold)' }}>
                        {song.optionalKey2 || 'No configurada'}
                      </span>
                    </div>
                    <button
                      onClick={() => setEditingKeySlot(2)}
                      className="w-full py-2 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                    >
                      {song.optionalKey2 ? 'Cambiar nota' : 'Configurar nota'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-sm mb-3">
                    Selecciona la nota para Opcional {editingKeySlot}
                  </h4>

                  {/* Toggle Mayor/Menor */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setIsMinor(false)}
                      className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                      style={{
                        backgroundColor: !isMinor ? 'var(--accent)' : 'var(--bg-tertiary)',
                        color: !isMinor ? 'white' : 'var(--text-primary)'
                      }}
                    >
                      Mayor
                    </button>
                    <button
                      onClick={() => setIsMinor(true)}
                      className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                      style={{
                        backgroundColor: isMinor ? 'var(--accent)' : 'var(--bg-tertiary)',
                        color: isMinor ? 'white' : 'var(--text-primary)'
                      }}
                    >
                      Menor
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {allNotes.map(note => (
                      <button
                        key={note}
                        onClick={() => handleSelectOptionalKey(editingKeySlot, note)}
                        className="py-4 rounded-xl text-lg font-bold hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: 'var(--accent-light)',
                          color: 'var(--accent)',
                          border: '2px solid var(--accent)'
                        }}
                      >
                        {note}{isMinor ? 'm' : ''}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setEditingKeySlot(null);
                      setIsMinor(false);
                    }}
                    className="w-full py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    Volver
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move to Hymnal Modal */}
      <AnimatePresence>
        {showMoveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowMoveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-5"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <h3 className="font-bold text-lg mb-3">Mover a otro cancionero</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {[...hymnals, ...state.customHymnals].map(hymnal => (
                  <button
                    key={hymnal.id}
                    onClick={() => handleMoveToHymnal(hymnal.id)}
                    disabled={hymnal.id === song.hymnalId}
                    className="w-full text-left p-3 rounded-xl border transition-all hover:scale-[1.01] disabled:opacity-50"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{hymnal.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{hymnal.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {hymnal.language}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
