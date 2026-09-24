import { useState } from 'react';
import { Hymnal } from '../types';
import { X, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EditHymnalModalProps {
  hymnal: Hymnal;
  onClose: () => void;
  onSave: (updatedHymnal: Hymnal) => void;
}

export default function EditHymnalModal({ hymnal, onClose, onSave }: EditHymnalModalProps) {
  const [name, setName] = useState(hymnal.name);
  const [description, setDescription] = useState(hymnal.description);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    hymnal.language.split('/').map(l => l.trim())
  );
  const [icon, setIcon] = useState(hymnal.icon);
  const [color, setColor] = useState(hymnal.color);
  const [image, setImage] = useState<string | null>(hymnal.image || null);
  const [codePrefix, setCodePrefix] = useState(hymnal.codePrefix || '');

  const availableLanguages = ['Castellano', 'Aymara', 'Quechua', 'Inglés', 'Portugués', 'Francés', 'Italiano', 'Alemán'];

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const icons = ['🎵', '🎶', '🎼', '🎹', '🎸', '🎺', '🎻', '⛪', '🕊️', '✝️', '📖', '🌟', '🏔️', '🌿', '🌊', '🔥', '❤️', '👑'];
  const colors = ['#a855f7', '#3b82f6', '#10b981', '#22c55e', '#f97316', '#ef4444', '#eab308', '#06b6d4', '#8b5cf6', '#ec4899'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedHymnal: Hymnal = {
      ...hymnal,
      name,
      description,
      language: selectedLanguages.join('/'),
      icon,
      color,
      image: image || undefined,
      codePrefix: codePrefix.trim() || undefined,
    };
    onSave(updatedHymnal);
    onClose();
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
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Editar Cancionero</h2>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Nombre</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 rounded-xl border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Descripción</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Idiomas (selección múltiple)</label>
            <div className="grid grid-cols-2 gap-2">
              {availableLanguages.map(lang => (
                <label
                  key={lang}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all"
                  style={{
                    backgroundColor: selectedLanguages.includes(lang) ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    border: selectedLanguages.includes(lang) ? '2px solid var(--accent)' : '2px solid transparent'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(lang)}
                    onChange={() => toggleLanguage(lang)}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <span className="text-sm">{lang}</span>
                </label>
              ))}
            </div>
            {selectedLanguages.length > 0 && (
              <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                Seleccionados: {selectedLanguages.join(', ')}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Prefijo de Código</label>
            <input
              value={codePrefix}
              onChange={e => setCodePrefix(e.target.value.toUpperCase())}
              maxLength={3}
              className="w-full p-3 rounded-xl border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              placeholder="Ej: A, B, AL (1-3 letras)"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Este prefijo se usará para los códigos de las canciones (ej: {codePrefix || 'A'}1, {codePrefix || 'A'}2, {codePrefix || 'A'}3...)
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Ícono</label>
            <div className="grid grid-cols-9 gap-2">
              {icons.map(ic => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all"
                  style={{
                    backgroundColor: icon === ic ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                    border: icon === ic ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-10 h-10 rounded-xl transition-all"
                  style={{
                    backgroundColor: c,
                    border: color === c ? '3px solid var(--text-primary)' : '3px solid transparent',
                    transform: color === c ? 'scale(1.1)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Imagen de Portada (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="hymnal-image-upload"
            />
            <label
              htmlFor="hymnal-image-upload"
              className="w-full p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-80"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
            >
              <ImageIcon size={20} style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {image ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </span>
            </label>
            {image && (
              <div className="mt-2 relative">
                <img src={image} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Guardar Cambios
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
