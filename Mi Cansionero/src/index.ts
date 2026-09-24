export interface Song {
  id: string;
  title: string;
  artist: string;
  code: string; // Código completo (prefijo + número), se genera automáticamente
  number?: number; // Número de la canción dentro del himnario
  hymnalId: string;
  key: string;
  timeSignature: string;
  bpm: number;
  language: string;
  categories: string[];
  sections: SongSection[];
  lyrics: string; // raw lyrics with chord format //C Letra
  notes: string;
  lyricsByLanguage?: Record<string, string>; // Para canciones bilingües: { "Castellano": "...", "Aymara": "..." }
  optionalKey1?: string; // Primera nota opcional para transposición rápida
  optionalKey2?: string; // Segunda nota opcional para transposición rápida
}

export interface SongSection {
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'pre-chorus';
  label: string;
  lines: string[];
}

export interface Hymnal {
  id: string;
  name: string;
  description: string;
  language: string;
  icon: string;
  color: string;
  isCustom: boolean;
  image?: string;
  codePrefix?: string; // Prefijo para códigos de canciones (ej: "A", "B", "AL")
}

export interface Setlist {
  id: string;
  name: string;
  songs: SetlistSong[];
  createdAt: string;
  updatedAt: string;
  notes: string;
}

export interface OrderItem {
  id: string;
  type: 'text' | 'song';
  content: string; // Texto o ID de canción
  songId?: string; // Si es tipo 'song'
  notes?: string;
}

export interface Order {
  id: string;
  name: string;
  eventType: string; // Culto, Boda, Bautismo, etc.
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  notes: string;
}

export interface SetlistSong {
  songId: string;
  transposition: number;
  notes: string;
  order: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
  showChords: boolean;
  capo: number;
}

export interface AppState {
  favorites: string[];
  setlists: Setlist[];
  orders: Order[];
  preferences: UserPreferences;
  personalNotes: Record<string, string>;
  customHymnals: Hymnal[];
  customSongs: Song[];
}
