import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Sun, Menu, X, Home, Search, Star, ListMusic, Music, Settings, Download, Upload, Plus, Heart, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  onImport: () => void;
  onExport: () => void;
  onAddHymnal: () => void;
  onBgImageChange: () => void;
  onRemoveBgImage: () => void;
  hasBgImage: boolean;
}

function Sidebar({ isOpen, onClose, onNavigate, currentPage, onImport, onExport, onAddHymnal, onBgImageChange, onRemoveBgImage, hasBgImage }: SidebarProps) {
  const { state, setTheme } = useApp();

  const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'search', label: 'Buscar Canciones', icon: Search },
    { id: 'favorites', label: 'Favoritos', icon: Star },
    { id: 'setlists', label: 'Lista de canciones', icon: ListMusic },
    { id: 'orders', label: 'Orden de evento', icon: Music },
    { id: 'tools', label: 'Herramientas', icon: Music },
  ];

  const secondaryItems = [
    { id: 'add-hymnal', label: 'Nuevo Himnario', icon: Plus, action: onAddHymnal },
    { id: 'import', label: 'Importar Datos', icon: Upload, action: onImport },
    { id: 'export', label: 'Exportar Datos', icon: Download, action: onExport },
  ];

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-80 flex flex-col"
            style={{ backgroundColor: 'var(--bg-primary)', borderRight: '1px solid var(--border-color)' }}
          >
            {/* Header */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                       style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    7
                  </div>
                  <div>
                    <h1 className="font-bold text-lg" style={{ color: 'var(--accent)' }}>
                      Cancionero<span className="font-black">7Pro</span>
                    </h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>v1.0 Premium</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                    {state.favorites.length}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Favoritos</div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                    {state.setlists.length}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Listas</div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                    {state.customSongs.length + 14}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Canciones</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: 'var(--text-muted)' }}>
                  Navegación
                </p>
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all"
                    style={{
                      backgroundColor: currentPage === item.id ? 'var(--accent-light)' : 'transparent',
                      color: currentPage === item.id ? 'var(--accent)' : 'var(--text-primary)',
                    }}
                  >
                    <item.icon size={20} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: 'var(--text-muted)' }}>
                  Gestión
                </p>
                {secondaryItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { item.action?.(); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all hover:opacity-80"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <item.icon size={20} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                ))}
                <button
                  onClick={() => { onBgImageChange(); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Image size={20} />
                  <span className="font-medium text-sm">{hasBgImage ? 'Cambiar Fondo' : 'Imagen de Fondo'}</span>
                </button>
                {hasBgImage && (
                  <button
                    onClick={() => { onRemoveBgImage(); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all hover:opacity-80 text-red-500"
                  >
                    <X size={20} />
                    <span className="font-medium text-sm">Quitar Fondo</span>
                  </button>
                )}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button
                onClick={() => setTheme(state.preferences.theme === 'dark' ? 'light' : 'dark')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                {state.preferences.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                Modo {state.preferences.theme === 'dark' ? 'Claro' : 'Oscuro'}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Layout({ children, currentPage, onNavigate, onImport, onExport, onAddHymnal }: {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onImport: () => void;
  onExport: () => void;
  onAddHymnal: () => void;
}) {
  const { state, setTheme } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.className = state.preferences.theme;
    // Cargar imagen de fondo guardada
    const savedBg = localStorage.getItem('cancionero-bg-image');
    if (savedBg) {
      setBgImage(savedBg);
    }
  }, [state.preferences.theme]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowListsDropdown(false);
      }
    };

    if (showListsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showListsDropdown]);

  const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setBgImage(result);
        localStorage.setItem('cancionero-bg-image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBgImage = () => {
    setBgImage(null);
    localStorage.removeItem('cancionero-bg-image');
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay para mejorar legibilidad */}
      {bgImage && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: state.preferences.theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)',
            zIndex: 0
          }}
        />
      )}

      <div className="relative" style={{ zIndex: 1 }}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={onNavigate}
          currentPage={currentPage}
          onImport={onImport}
          onExport={onExport}
          onAddHymnal={onAddHymnal}
          onBgImageChange={() => fileInputRef.current?.click()}
          onRemoveBgImage={removeBgImage}
          hasBgImage={!!bgImage}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleBgImageChange}
          style={{ display: 'none' }}
        />

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 rounded-xl transition-all active:scale-95"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              <Menu size={20} />
            </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              C7
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold leading-tight truncate" style={{ color: 'var(--accent)' }}>
                Cancionero<span className="font-black">7Pro</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] leading-tight truncate" style={{ color: 'var(--text-muted)' }}>
                Gestión Profesional de Alabanzas
              </p>
            </div>
          </div>          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('search')}
              className="p-2.5 rounded-xl transition-all active:scale-95"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => setTheme(state.preferences.theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl transition-all active:scale-95"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              {state.preferences.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 h-[calc(100vh-4rem-4rem)] overflow-y-auto">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-xl"
           style={{ backgroundColor: 'color-mix(in srgb, var(--bg-primary) 90%, transparent)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto flex">
          {[
            { id: 'home', label: 'Inicio', icon: Home },
            { id: 'search', label: 'Buscar', icon: Search },
            { id: 'favorites', label: 'Favoritos', icon: Heart },
            { id: 'lists-and-orders', label: 'Listas', icon: ListMusic },
            { id: 'tools', label: 'Tools', icon: Settings },
          ].map(item => {
            const isActive = currentPage === item.id ||
                            (item.id === 'lists-and-orders' && (currentPage === 'setlists' || currentPage === 'orders'));

            if (item.id === 'lists-and-orders') {
              return (
                <div key={item.id} className="flex-1 relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowListsDropdown(!showListsDropdown)}
                    className={`w-full flex flex-col items-center py-3 px-1 transition-all ${
                      isActive ? 'scale-105' : 'opacity-60'
                    }`}
                    style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                    <span className="text-[10px] font-semibold mt-1">{item.label}</span>
                    {isActive && (
                      <div className="absolute top-0 w-8 h-0.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                    )}
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {showListsDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-xl shadow-2xl overflow-hidden"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
                      >
                        <button
                          onClick={() => {
                            onNavigate('setlists');
                            setShowListsDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: currentPage === 'setlists' ? 'var(--accent-light)' : 'transparent',
                            color: currentPage === 'setlists' ? 'var(--accent)' : 'var(--text-primary)'
                          }}
                        >
                          <ListMusic size={16} />
                          <span className="font-medium">Lista de canciones</span>
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('orders');
                            setShowListsDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:opacity-80 transition-opacity border-t"
                          style={{
                            borderColor: 'var(--border-color)',
                            backgroundColor: currentPage === 'orders' ? 'var(--accent-light)' : 'transparent',
                            color: currentPage === 'orders' ? 'var(--accent)' : 'var(--text-primary)'
                          }}
                        >
                          <Music size={16} />
                          <span className="font-medium">Orden de evento</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center py-3 px-1 transition-all ${
                isActive ? 'scale-105' : 'opacity-60'
              }`}
              style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-semibold mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              )}
            </button>
            );
          })}
        </div>
      </nav>
      </div>
    </div>
  );
}
