import { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { Camera, Upload, X, Loader, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface SetlistExtractorProps {
  onClose: () => void;
  onExtract: (items: string[]) => void;
}

export default function SetlistExtractor({ onClose, onExtract }: SetlistExtractorProps) {
  const [image, setImage] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedItems, setExtractedItems] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);

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

      // Parsear el texto en líneas/items
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          // Remover números al inicio si existen (1. 2. 3. etc)
          return line.replace(/^\d+[\.\)]\s*/, '');
        });

      setExtractedItems(lines);
      setEditMode(true);
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Error al extraer texto de la imagen. Por favor intenta con otra imagen.');
    } finally {
      setExtracting(false);
    }
  };

  const handleItemEdit = (index: number, newValue: string) => {
    const newItems = [...extractedItems];
    newItems[index] = newValue;
    setExtractedItems(newItems);
  };

  const handleItemDelete = (index: number) => {
    const newItems = extractedItems.filter((_, i) => i !== index);
    setExtractedItems(newItems);
  };

  const handleConfirm = () => {
    // Filtrar items vacíos
    const validItems = extractedItems.filter(item => item.trim().length > 0);
    onExtract(validItems);
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
          <h2 className="text-xl font-bold">Crear Lista desde Foto</h2>
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
                Sube una foto de la lista de canciones
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="setlist-photo-upload"
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
                id="setlist-photo-camera"
              />
              <div className="flex gap-3 justify-center">
                <label
                  htmlFor="setlist-photo-upload"
                  className="inline-block px-6 py-3 rounded-xl font-medium cursor-pointer"
                  style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                >
                  <Upload size={20} className="inline mr-2" />
                  Galería
                </label>
                <label
                  htmlFor="setlist-photo-camera"
                  className="inline-block px-6 py-3 rounded-xl font-medium cursor-pointer"
                  style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                >
                  <Camera size={20} className="inline mr-2" />
                  Tomar Foto
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img src={image} alt="Uploaded" className="w-full rounded-xl max-h-64 object-cover" />
              <button
                onClick={() => {
                  setImage(null);
                  setExtractedItems([]);
                  setEditMode(false);
                }}
                className="absolute top-2 right-2 p-2 rounded-full"
                style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white' }}
              >
                <X size={16} />
              </button>
            </div>

            {!editMode ? (
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
                    Extraer Lista
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <h3 className="font-semibold mb-2">Lista Extraída (editable)</h3>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {extractedItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                           style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={item}
                        onChange={e => handleItemEdit(index, e.target.value)}
                        className="flex-1 p-2 rounded-lg border text-sm"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        placeholder="Nombre de la canción..."
                      />
                      <button
                        onClick={() => handleItemDelete(index)}
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ color: '#ef4444' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setExtractedItems([]);
                      setEditMode(false);
                    }}
                    className="flex-1 py-3 rounded-xl font-medium"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    Reintentar
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                  >
                    <Check size={20} />
                    Crear Lista
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
