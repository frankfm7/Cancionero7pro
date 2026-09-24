import { useState, useRef, useCallback, useEffect } from 'react';

const GUITAR_STRINGS = [
  { note: 'E2', freq: 82.41, label: '6ª', name: 'Mi grave' },
  { note: 'A2', freq: 110.00, label: '5ª', name: 'La' },
  { note: 'D3', freq: 146.83, label: '4ª', name: 'Re' },
  { note: 'G3', freq: 196.00, label: '3ª', name: 'Sol' },
  { note: 'B3', freq: 246.94, label: '2ª', name: 'Si' },
  { note: 'E4', freq: 329.63, label: '1ª', name: 'Mi aguda' },
];

const BASS_STRINGS = [
  { note: 'E1', freq: 41.20, label: '4ª', name: 'Mi' },
  { note: 'A1', freq: 55.00, label: '3ª', name: 'La' },
  { note: 'D2', freq: 73.42, label: '2ª', name: 'Re' },
  { note: 'G2', freq: 98.00, label: '1ª', name: 'Sol' },
];

const UKE_STRINGS = [
  { note: 'G4', freq: 392.00, label: '4ª', name: 'Sol' },
  { note: 'C4', freq: 261.63, label: '3ª', name: 'Do' },
  { note: 'E4', freq: 329.63, label: '2ª', name: 'Mi' },
  { note: 'A4', freq: 440.00, label: '1ª', name: 'La' },
];

type Instrument = 'guitar' | 'bass' | 'uke';

export default function Tuner() {
  const [instrument, setInstrument] = useState<Instrument>('guitar');
  const [playingFreq, setPlayingFreq] = useState<number | null>(null);
  const [isPlayingRef, setIsPlayingRef] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const getStrings = () => {
    switch (instrument) {
      case 'guitar': return GUITAR_STRINGS;
      case 'bass': return BASS_STRINGS;
      case 'uke': return UKE_STRINGS;
    }
  };

  const playNote = (freq: number, noteId: string) => {
    stopNote();

    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = freq;

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 3);

    oscillatorRef.current = oscillator;
    setPlayingFreq(freq);
    setIsPlayingRef(noteId);

    oscillator.onended = () => {
      setPlayingFreq(null);
      setIsPlayingRef(null);
    };
  };

  const stopNote = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch {}
      oscillatorRef.current = null;
    }
    setPlayingFreq(null);
    setIsPlayingRef(null);
  };

  useEffect(() => {
    return () => stopNote();
  }, []);

  const strings = getStrings();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-1">Afinador de Referencia</h3>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Toca una cuerda para escuchar la nota de referencia
        </p>
      </div>

      {/* Instrument Selector */}
      <div className="flex justify-center gap-2">
        {([
          { id: 'guitar' as Instrument, label: '🎸 Guitarra', strings: 6 },
          { id: 'bass' as Instrument, label: '🎸 Bajo', strings: 4 },
          { id: 'uke' as Instrument, label: '🎵 Ukelele', strings: 4 },
        ]).map(inst => (
          <button
            key={inst.id}
            onClick={() => { setInstrument(inst.id); stopNote(); }}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: instrument === inst.id ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: instrument === inst.id ? 'white' : 'var(--text-primary)',
            }}
          >
            {inst.label}
          </button>
        ))}
      </div>

      {/* Visual Tuner Display */}
      <div className="text-center py-4">
        {isPlayingRef ? (
          <div className="animate-pulse">
            <div className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>
              {strings.find(s => s.label === isPlayingRef)?.note}
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {playingFreq?.toFixed(2)} Hz
            </div>
            <div className="mt-3 flex justify-center">
              <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center animate-pulse"
                   style={{ borderColor: 'var(--accent)', animation: 'pulse 1s infinite' }}>
                <div className="w-16 h-16 rounded-full" style={{ backgroundColor: 'var(--accent)', opacity: 0.3 }} />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-2">🎵</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Selecciona una cuerda
            </div>
          </div>
        )}
      </div>

      {/* Strings */}
      <div className="grid grid-cols-2 gap-3">
        {strings.map((string) => (
          <button
            key={string.label}
            onClick={() => playNote(string.freq, string.label)}
            className="p-4 rounded-xl border text-center transition-all active:scale-95"
            style={{
              backgroundColor: isPlayingRef === string.label ? 'var(--accent-light)' : 'var(--card-bg)',
              borderColor: isPlayingRef === string.label ? 'var(--accent)' : 'var(--border-color)',
            }}
          >
            <div className="text-2xl font-bold" style={{ color: isPlayingRef === string.label ? 'var(--accent)' : 'var(--text-primary)' }}>
              {string.note}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Cuerda {string.label} • {string.name}
            </div>
            <div className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
              {string.freq.toFixed(2)} Hz
            </div>
          </button>
        ))}
      </div>

      {/* Stop Button */}
      {isPlayingRef && (
        <div className="text-center">
          <button
            onClick={stopNote}
            className="px-6 py-2 rounded-xl text-sm font-medium"
            style={{ backgroundColor: '#ef4444', color: 'white' }}
          >
            ⏹ Detener
          </button>
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl border p-4"
           style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <h4 className="text-sm font-bold mb-2">💡 Consejos de afinación</h4>
        <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
          <li>• Afina en un ambiente silencioso</li>
          <li>• Toca la cuerda libre (sin pisar trastes)</li>
          <li>• Compara el sonido con la referencia</li>
          <li>• Ajusta la clavija hasta igualar el tono</li>
          <li>• Guitarra estándar: E A D G B E</li>
        </ul>
      </div>
    </div>
  );
}
