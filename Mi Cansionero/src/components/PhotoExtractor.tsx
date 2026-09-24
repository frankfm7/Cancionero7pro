import { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { Camera, Upload, X, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

interface PhotoExtractorProps {
  onClose: () => void;
  onExtract: ( { title: string; artist: string; lyrics: string }) => void;
}

export default function PhotoExtractor({ onClose, onExtract }: PhotoExtractorProps) {
  const [image, setImage] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractText = async () => {
    if (!image) return;

    setExtracting(true);
    setProgress(0);

    try {
      const worker = await createWorker('spa+eng', 1, {
        logger: (m) => {
          if (m.progress) {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const {  { text } } = await worker.recognize(image);
      await worker.terminate();

      setExtractedText(text);

      // Intentar extraer título y artista del texto
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length > 0) {
        setTitle(lines[0].trim());
        if (lines.length > 1) {
          setArtist(lines[1].trim());
        }
      }

      // Convertir el texto extraído a formato de acordes
      const formattedLyrics = formatExtractedLyrics(text);
      setExtractedText(formattedLyrics);
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Error al extraer texto de la imagen. Por favor intenta con otra imagen.');
    } finally {
      setExtracting(false);
    }
  };

  const formatExtractedLyrics = (text: string): string => {
    // Intentar detectar patrones de acordes y formatear
    const lines = text.split('\n');
    const formatted: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Detectar si la línea parece ser acordes (contiene notas musicales)
      const chordPattern = /\b[CDEFGAB](#|b)?(m|M|Maj|min|dim|aug|sus|add)?[0-9]?\b/g;
      const hasChords = (line.match(chordPattern) || []).length >= 2;

      if (hasChords) {
        // Si es una línea de acordes, agregar // al inicio
        formatted.push(`//${line}`);
        // Si la siguiente línea existe y no es de acordes, es la letra
        if (i + 1 < lines.length && !lines[i + 1].trim().match(chordPattern)) {
          formatted.push(lines[i + 1].trim());
          i++; // Saltar la línea de letra
        }
      } else {
        // Si no es acordes, agregar como letra normal
        formatted.push(line);
      }
    }

    return formatted.join('\n');
  };

  const handleConfirm = () => {
    onExtract({
      title: title.trim() || 'Canción Extraída',
      artist: artist.trim() || 'Artista Desconocido',
      lyrics: extractedText,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Extraer Canción de Foto</h2>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <X size={18} />
          </button>
        </div>

        {!image ? (
          <div className="space-y-4">
            <div className="p-8 rounded-2xl border-2 border-dashed text-center"
                 style={{ borderColor: 'var(--border-color)' }}>
              <Camera size={64} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Sube una foto o captura de pantalla de la canción
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="inline-block px-6 py-3 rounded-xl font-medium cursor-pointer"
                style={{ backgroundColor: 'var(--accent)', color: 'white' }}
              >
                <Upload size={20} className="inline mr-2" />
                Seleccionar Imagen
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img src={image} alt="Uploaded" className="w-full rounded-xl" />
              <button
                onClick={() => {
                  setImage(null);
                  setExtractedText('');
                  setTitle('');
                  setArtist('');
                }}
                className="absolute top-2 right-2 p-2 rounded-full"
                style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white' }}
              >
                <X size={16} />
              </button>
            </div>

            {!extractedText ? (
              <button
                onClick={extractText}
                disabled={extracting}
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                style={{
                  backgroundColor: extracting ? 'var(--bg-tertiary)' : 'var(--accent)',
                  color: extracting ? 'var(--text-muted)' : 'white'
                }}
              >
                {extracting ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Extrayendo... {progress}%
                  </>
                ) : (
                  <>
                    <Camera size={20} />
                    Extraer Texto
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Título</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Artista</label>
                  <input
                    value={artist}
                    onChange={e => setArtist(e.target.value)}
                    className="w-full p-3 rounded-xl border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Letra Extraída (editable)</label>
                  <textarea
                    value={extractedText}
                    onChange={e => setExtractedText(e.target.value)}
                    className="w-full p-3 rounded-xl border font-mono resize-none"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      minHeight: '300px',
                      lineHeight: '1.8'
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Revisa y edita el texto extraído antes de guardar
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setExtractedText('');
                      setTitle('');
                      setArtist('');
                    }}
                    className="flex-1 py-3 rounded-xl font-medium"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    Reintentar
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 rounded-xl font-bold"
                    style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
