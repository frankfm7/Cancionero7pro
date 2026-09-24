import { useState } from 'react';
import Metronome from './Metronome';
import Tuner from './Tuner';

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<'menu' | 'metronome' | 'tuner'>('menu');

  if (activeTool === 'metronome') {
    return (
      <div className="max-w-lg mx-auto">
        <button onClick={() => setActiveTool('menu')}
                className="mb-4 px-3 py-1.5 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          ← Herramientas
        </button>
        <Metronome />
      </div>
    );
  }

  if (activeTool === 'tuner') {
    return (
      <div className="max-w-lg mx-auto">
        <button onClick={() => setActiveTool('menu')}
                className="mb-4 px-3 py-1.5 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          ← Herramientas
        </button>
        <Tuner />
      </div>
    );
  }

  const tools = [
    {
      id: 'metronome' as const,
      icon: '🥁',
      title: 'Metrónomo',
      description: 'Control de tempo con tap tempo, múltiples sonidos y compases',
      color: '#7c3aed',
    },
    {
      id: 'tuner' as const,
      icon: '🎸',
      title: 'Afinador',
      description: 'Referencia de afinación para guitarra, bajo y ukelele',
      color: '#059669',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎵</span>
        <div>
          <h2 className="text-lg font-bold">Herramientas Musicales</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Metrónomo, afinador y más
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className="p-6 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}
          >
            <div className="text-4xl mb-3">{tool.icon}</div>
            <h3 className="font-bold text-lg mb-1">{tool.title}</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {tool.description}
            </p>
          </button>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="rounded-xl border p-4 text-center"
           style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          🔜 Próximamente: Escáner de partituras, Modo Presentación, Control Remoto
        </p>
      </div>
    </div>
  );
}
