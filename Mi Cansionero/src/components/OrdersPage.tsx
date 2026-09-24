import { useState, useEffect, useRef } from 'react';
import { Order, OrderItem, Song } from '../types';
import { useApp } from '../context/AppContext';
import { Plus, ChevronUp, ChevronDown, GripVertical, Camera, MoreVertical, Edit2, Trash2, CheckSquare, Square, X, Music, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { songs as allSongs } from '../data/songs';
import OrderExtractor from './OrderExtractor';

export default function OrdersPage({ onSelectSong, onBack }: { onSelectSong: (song: Song) => void; onBack?: () => void }) {
  const { state, addOrder, removeOrder, updateOrder } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExtractor, setShowExtractor] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [newOrderName, setNewOrderName] = useState('');
  const [newOrderType, setNewOrderType] = useState('Culto');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [songSearchQuery, setSongSearchQuery] = useState('');

  const orders = state.orders || [];
  const allAvailableSongs = [...allSongs, ...(state.customSongs || [])];
  const editRef = useRef<HTMLDivElement>(null);

  // Cerrar edición al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editRef.current && !editRef.current.contains(event.target as Node)) {
        setEditingItem(null);
      }
    };

    if (editingItem) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingItem]);

  // Cerrar menú de agregar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-add-menu]')) {
        setShowAddMenu(false);
      }
    };

    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddMenu]);

  // Cerrar menú de tres puntos al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-item-menu]')) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const createOrder = () => {
    const newOrder: Order = {
      id: crypto.randomUUID(),
      name: newOrderName.trim() || `Orden ${orders.length + 1}`,
      eventType: newOrderType,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: '',
    };

    addOrder(newOrder);
    setSelectedOrder(newOrder);
    setNewOrderName('');
    setShowCreateModal(false);
  };

  const addTextItem = () => {
    if (!selectedOrder) return;

    const newItem: OrderItem = {
      id: crypto.randomUUID(),
      type: 'text',
      content: '',
      notes: '',
    };

    const updatedOrder = {
      ...selectedOrder,
      items: [...selectedOrder.items, newItem],
      updatedAt: new Date().toISOString(),
    };

    updateOrder(updatedOrder);
    setSelectedOrder(updatedOrder);
    setEditingItem(newItem.id);
    setShowAddMenu(false);
  };

  const addSongItem = () => {
    if (!selectedOrder) return;

    const newItem: OrderItem = {
      id: crypto.randomUUID(),
      type: 'song',
      content: '',
      notes: '',
    };

    const updatedOrder = {
      ...selectedOrder,
      items: [...selectedOrder.items, newItem],
      updatedAt: new Date().toISOString(),
    };

    updateOrder(updatedOrder);
    setSelectedOrder(updatedOrder);
    setEditingItem(newItem.id);
    setShowAddMenu(false);
  };

  const updateItem = (itemId: string, updates: Partial<OrderItem>) => {
    if (!selectedOrder) return;

    const updatedItems = selectedOrder.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    const updatedOrder = {
      ...selectedOrder,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    updateOrder(updatedOrder);
    setSelectedOrder(updatedOrder);
  };

  const removeItem = (itemId: string) => {
    if (!selectedOrder) return;

    const updatedOrder = {
      ...selectedOrder,
      items: selectedOrder.items.filter(item => item.id !== itemId),
      updatedAt: new Date().toISOString(),
    };

    updateOrder(updatedOrder);
    setSelectedOrder(updatedOrder);
    setOpenMenuId(null);
  };

  const removeSelectedItems = () => {
    if (!selectedOrder || selectedItems.size === 0) return;

    if (!confirm(`¿Eliminar ${selectedItems.size} elemento(s)?`)) return;

    const updatedOrder = {
      ...selectedOrder,
      items: selectedOrder.items.filter(item => !selectedItems.has(item.id)),
      updatedAt: new Date().toISOString(),
    };

    updateOrder(updatedOrder);
    setSelectedOrder(updatedOrder);
    setSelectedItems(new Set());
    setSelectionMode(false);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!selectedOrder) return;

    const newItems = [...selectedOrder.items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newItems.length) return;

    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    const updatedOrder = {
      ...selectedOrder,
      items: newItems,
      updatedAt: new Date().toISOString(),
    };

    updateOrder(updatedOrder);
    setSelectedOrder(updatedOrder);
  };

  const handleExtracted = (items: string[]) => {
    const newOrder: Order = {
      id: crypto.randomUUID(),
      name: `Orden extraída ${orders.length + 1}`,
      eventType: 'Culto',
      items: items.map(text => ({
        id: crypto.randomUUID(),
        type: 'text' as const,
        content: text,
        notes: '',
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: '',
    };

    addOrder(newOrder);
    setSelectedOrder(newOrder);
    setShowExtractor(false);
  };

  const getItemSong = (item: OrderItem): Song | undefined => {
    if (item.type === 'song' && item.content) {
      return allAvailableSongs.find(s => s.id === item.content);
    }
    return undefined;
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const filteredSongs = allAvailableSongs.filter(song =>
    song.title.toLowerCase().includes(songSearchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(songSearchQuery.toLowerCase()) ||
    song.code.toLowerCase().includes(songSearchQuery.toLowerCase())
  );

  if (selectedOrder) {
    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedOrder) {
                setSelectedOrder(null);
                setSelectionMode(false);
                setSelectedItems(new Set());
              } else if (onBack) {
                onBack();
              }
            }}
            className="p-2 rounded-xl"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            ←
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{selectedOrder.name}</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {selectedOrder.eventType} • {selectedOrder.items.length} elementos
            </p>
          </div>
          <button
            onClick={() => {
              setReorderMode(!reorderMode);
              setSelectionMode(false);
            }}
            className="p-2 rounded-xl"
            style={{ backgroundColor: reorderMode ? 'var(--accent)' : 'var(--bg-tertiary)', color: reorderMode ? 'white' : 'var(--text-primary)' }}
            title="Reordenar"
          >
            <GripVertical size={20} />
          </button>
          <button
            onClick={() => {
              setSelectionMode(!selectionMode);
              setReorderMode(false);
              setSelectedItems(new Set());
            }}
            className="p-2 rounded-xl"
            style={{ backgroundColor: selectionMode ? 'var(--accent)' : 'var(--bg-tertiary)', color: selectionMode ? 'white' : 'var(--text-primary)' }}
            title="Seleccionar"
          >
            <CheckSquare size={20} />
          </button>
        </div>

        {/* Selection Actions */}
        {selectionMode && selectedItems.size > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: 'var(--accent-light)', border: '1px solid var(--accent)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              {selectedItems.size} seleccionado(s)
            </span>
            <div className="flex-1" />
            <button
              onClick={removeSelectedItems}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
              style={{ backgroundColor: '#ef4444', color: 'white' }}
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-2">
          {selectedOrder.items.map((item, index) => {
            const song = getItemSong(item);
            const isEditing = editingItem === item.id;

            return (
              <motion.div
                key={item.id}
                layout
                className="flex items-start gap-2 p-3 rounded-xl border"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: selectedItems.has(item.id) ? 'var(--accent)' : 'var(--border-color)',
                  borderWidth: selectedItems.has(item.id) ? '2px' : '1px'
                }}
              >
                {/* Selection Checkbox */}
                {selectionMode && (
                  <button
                    onClick={() => toggleItemSelection(item.id)}
                    className="p-1 mt-1"
                    style={{ color: selectedItems.has(item.id) ? 'var(--accent)' : 'var(--text-muted)' }}
                  >
                    {selectedItems.has(item.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                )}

                {/* Reorder Buttons */}
                {reorderMode && (
                  <div className="flex flex-col gap-1 mt-1">
                    <button
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded disabled:opacity-30"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === selectedOrder.items.length - 1}
                      className="p-1 rounded disabled:opacity-30"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                )}

                {/* Item Number */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1"
                     style={{ backgroundColor: item.type === 'song' ? 'var(--accent-light)' : 'var(--bg-tertiary)', color: item.type === 'song' ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {index + 1}
                </div>

                {/* Item Content */}
                <div className="flex-1 min-w-0" ref={isEditing ? editRef : null}>
                  {isEditing ? (
                    <div className="space-y-2">
                      {item.type === 'text' ? (
                        <>
                          <input
                            type="text"
                            value={item.content}
                            onChange={e => updateItem(item.id, { content: e.target.value })}
                            placeholder="Ej: Oración, Predicación..."
                            className="w-full p-2 rounded-lg border text-sm font-semibold"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                            autoFocus
                          />
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={e => updateItem(item.id, { notes: e.target.value })}
                            placeholder="Nota (ej: Pastor Juan)"
                            className="w-full p-2 rounded-lg border text-xs"
                            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                          />
                        </>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                            <input
                              type="text"
                              value={songSearchQuery}
                              onChange={e => setSongSearchQuery(e.target.value)}
                              placeholder="Buscar canción..."
                              className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm"
                              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                              autoFocus
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border p-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                            {filteredSongs.slice(0, 10).map(song => (
                              <button
                                key={song.id}
                                onClick={() => {
                                  updateItem(item.id, { content: song.id });
                                  setSongSearchQuery('');
                                  setEditingItem(null); // Cerrar edición automáticamente
                                }}
                                className="w-full text-left p-2 rounded hover:opacity-80 text-sm"
                                style={{ backgroundColor: item.content === song.id ? 'var(--accent-light)' : 'transparent' }}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{song.code}</span>
                                  <span className="font-medium">{song.title}</span>
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{song.artist}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (item.type === 'song' && song) {
                          onSelectSong(song);
                        }
                      }}
                      className="w-full text-left"
                    >
                      {item.type === 'song' && song ? (
                        <>
                          <div className="font-medium text-sm">{song.title}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {song.artist} • {song.key}
                          </div>
                        </>
                      ) : item.type === 'text' ? (
                        <>
                          <div className="font-medium text-sm">{item.content || 'Sin texto'}</div>
                          {item.notes && (
                            <div className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                              {item.notes}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                          Sin canción seleccionada
                        </div>
                      )}
                    </button>
                  )}
                </div>

                {/* Three-dot Menu */}
                {!isEditing && !selectionMode && !reorderMode && (
                  <div className="relative" data-item-menu>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenuId === item.id && (
                      <div
                        className="absolute right-0 top-full mt-1 w-40 rounded-xl shadow-lg overflow-hidden z-50"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
                      >
                        <button
                          onClick={() => {
                            setEditingItem(item.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:opacity-80"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <Edit2 size={14} /> Editar
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:opacity-80"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}

          {selectedOrder.items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No hay elementos en este orden
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Usa el botón + para agregar elementos
              </p>
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        {!selectionMode && !reorderMode && (
          <div className="fixed bottom-24 right-4 z-30" data-add-menu>
            <AnimatePresence>
              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-2 rounded-xl shadow-lg overflow-hidden"
                  style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
                >
                  <button
                    onClick={addTextItem}
                    className="w-full px-4 py-3 text-left text-sm flex items-center gap-2 hover:opacity-80"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Edit2 size={16} /> Agregar texto
                  </button>
                  <button
                    onClick={addSongItem}
                    className="w-full px-4 py-3 text-left text-sm flex items-center gap-2 hover:opacity-80 border-t"
                    style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  >
                    <Music size={16} /> Agregar canción
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 hover:scale-105"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(124,58,237,0.4)'
              }}
            >
              <Plus size={28} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              ←
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold">Órdenes de Evento</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {orders.length} órdenes
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExtractor(true)}
            className="p-2 rounded-xl"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
            title="Crear desde foto"
          >
            <Camera size={20} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 rounded-xl"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {orders.map(order => (
          <div
            key={order.id}
            className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            <button onClick={() => setSelectedOrder(order)} className="flex-1 text-left">
              <div className="font-medium">{order.name}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {order.eventType} • {order.items.length} elementos
              </div>
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Eliminar "${order.name}"?`)) {
                  removeOrder(order.id);
                }
              }}
              className="p-2 rounded-lg"
              style={{ color: '#ef4444' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No hay órdenes de evento
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Crea uno con el botón + o escanea una foto con 📷
            </p>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-5"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <h3 className="font-bold text-lg mb-3">Nuevo Orden de Evento</h3>

              <input
                type="text"
                value={newOrderName}
                onChange={e => setNewOrderName(e.target.value)}
                placeholder="Nombre del orden (opcional)"
                className="w-full p-3 rounded-xl border mb-3"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />

              <select
                value={newOrderType}
                onChange={e => setNewOrderType(e.target.value)}
                className="w-full p-3 rounded-xl border mb-4"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option>Culto</option>
                <option>Culto Nocturno</option>
                <option>Boda</option>
                <option>Bautismo</option>
                <option>Retiro</option>
                <option>Conferencia</option>
                <option>Otro</option>
              </select>

              <button
                onClick={createOrder}
                className="w-full py-3 rounded-xl font-bold"
                style={{ backgroundColor: 'var(--accent)', color: 'white' }}
              >
                Crear
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showExtractor && (
        <OrderExtractor
          onClose={() => setShowExtractor(false)}
          onExtract={handleExtracted}
        />
      )}
    </div>
  );
}
