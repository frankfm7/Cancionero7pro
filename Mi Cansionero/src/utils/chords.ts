// New chord format parser
// Edit format: //Am F Em (chord line starting with //)
//              Texto de la canción (lyric line below)
// View format: Chords displayed ABOVE lyrics, aligned

export interface ParsedLine {
  type: 'chord' | 'lyric' | 'section' | 'empty' | 'combined';
  chords?: string[]; // Array of {chord, position} for aligned display
  text?: string;
  content?: string;
  // For combined lines (chord + lyric paired)
  chordLine?: string;
  lyricLine?: string;
}

export interface AlignedChord {
  chord: string;
  position: number; // character position in the lyric line
}

// Parse the format: //chords followed by lyric line
export function parseLyrics(lyrics: string): ParsedLine[] {
  const lines = lyrics.split('\n');
  const result: ParsedLine[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (trimmed === '') {
      result.push({ type: 'empty' });
      i++;
      continue;
    }

    // Section header (VERSO, CORO, PUENTE, INTRO, FINAL, PRE-CORO, etc.)
    if (isSectionHeader(trimmed)) {
      result.push({ type: 'section', content: trimmed });
      i++;
      continue;
    }

    // Chord line (starts with //)
    if (trimmed.startsWith('//')) {
      const chordLine = trimmed.substring(2).trim();
      // Check if next line is a lyric line
      if (i + 1 < lines.length && lines[i + 1].trim() !== '' && !lines[i + 1].trim().startsWith('//') && !isSectionHeader(lines[i + 1].trim())) {
        const lyricLine = lines[i + 1];
        result.push({
          type: 'combined',
          chordLine: chordLine,
          lyricLine: lyricLine,
        });
        i += 2;
      } else {
        result.push({ type: 'chord', content: chordLine });
        i++;
      }
      continue;
    }

    // Regular lyric line (no chords)
    result.push({ type: 'lyric', text: line });
    i++;
  }

  return result;
}

function isSectionHeader(line: string): boolean {
  const sections = ['VERSO', 'CORO', 'PUENTE', 'INTRO', 'FINAL', 'PRE-CORO', 'PRE CORO', 'OUTRO', 'BRIDGE'];
  const upper = line.toUpperCase().trim();
  return sections.some(s => upper === s || upper.startsWith(s + ' ') || upper.startsWith(s + '\t') || new RegExp(`^${s}\\d*$`).test(upper));
}

// Transpose lyrics maintaining the format
export function transposeLyrics(lyrics: string, semitones: number): string {
  if (semitones === 0) return lyrics;

  const lines = lyrics.split('\n');
  return lines.map(line => {
    const trimmed = line.trim();

    // Transpose chord lines (starting with //)
    if (trimmed.startsWith('//')) {
      const chordPart = trimmed.substring(2);
      const transposed = transposeChordLine(chordPart, semitones);
      return '//' + transposed;
    }

    return line;
  }).join('\n');
}

function transposeChordLine(chordLine: string, semitones: number): string {
  // Split by spaces but preserve spacing
  return chordLine.replace(/([A-G][#b]?\w*)/g, (chord) => {
    return transposeChord(chord, semitones);
  });
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_MAP: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#',
  'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B'
};

function normalizeNote(note: string): string {
  return FLAT_MAP[note] || note;
}

function getNoteIndex(note: string): number {
  const normalized = normalizeNote(note);
  return NOTES.indexOf(normalized);
}

function transposeNote(note: string, semitones: number): string {
  const index = getNoteIndex(note);
  if (index === -1) return note;
  const newIndex = ((index + semitones) % 12 + 12) % 12;
  return NOTES[newIndex];
}

export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord;
  const chordRegex = /^([A-G][#b]?)(.*)$/;
  const match = chord.match(chordRegex);
  if (!match) return chord;
  const [, root, rest] = match;
  return transposeNote(root, semitones) + rest;
}

// Get current key from transposed lyrics
export function getCurrentKey(originalKey: string, transposition: number): string {
  if (transposition === 0) return originalKey;
  const idx = NOTES.indexOf(originalKey);
  if (idx === -1) return originalKey;
  return NOTES[((idx + transposition) % 12 + 12) % 12];
}

// Generate template for new song
export function generateSongTemplate(): string {
  return `INTRO
//Am  F  Em  Am

VERSO 1
//Am           F             Em       Am
Escribe aquí la letra de la canción
//Am           F             Em       Am
con los acordes alineados arriba

CORO
//F              G           Am
La letra del coro va aquí
//F              G           Am
con acordes en la línea de arriba

PUENTE
//Dm             G           Am
Puente de la canción
//Dm             G           Am
con su respectiva línea de acordes

FINAL
//Am  F  Em  Am`;
}
