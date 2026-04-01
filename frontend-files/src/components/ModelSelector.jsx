import React from 'react';

const MODELS = [
  { id: 'logistic_regression', name: 'Logistic Regression', icon: '⚡', color: 'blue',   desc: 'Classifieur linéaire rapide, idéal pour données séparables linéairement.' },
  { id: 'random_forest',       name: 'Random Forest',       icon: '🌲', color: 'green',  desc: 'Ensemble d\'arbres de décision. Robuste et performant sur données tabulaires.' },
  { id: 'svm',                 name: 'SVM',                 icon: '🔷', color: 'purple', desc: 'Trouve l\'hyperplan optimal pour séparer les classes.' },
  { id: 'knn',                 name: 'KNN',                 icon: '🎯', color: 'yellow', desc: 'Classe selon les k voisins les plus proches. Simple et interprétable.' },
];

const COLOR_MAP = {
  blue:   { border: 'border-blue-500',   bg: 'bg-blue-500/10',   text: 'text-blue-400',   badge: 'bg-blue-500/20 text-blue-300' },
  green:  { border: 'border-green-500',  bg: 'bg-green-500/10',  text: 'text-green-400',  badge: 'bg-green-500/20 text-green-300' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
  yellow: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300' },
};

export default function ModelSelector({ selected, onChange, compareMode, onCompareModeChange }) {
  const toggle = (id) => {
    if (compareMode) {
      if (selected.includes(id)) {
        if (selected.length > 1) onChange(selected.filter((x) => x !== id));
      } else {
        onChange([...selected, id]);
      }
    } else {
      onChange([id]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
          Sélection du modèle
        </h2>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs text-gray-400">Comparer</span>
          <div
            onClick={() => onCompareModeChange(!compareMode)}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${compareMode ? 'bg-blue-500' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${compareMode ? 'left-5' : 'left-0.5'}`} />
          </div>
        </label>
      </div>

      {/* Model cards */}
      <div className="grid grid-cols-2 gap-3">
        {MODELS.map((m) => {
          const c   = COLOR_MAP[m.color];
          const sel = selected.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => toggle(m.id)}
              className={`relative text-left p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02]
                ${sel ? `${c.border} ${c.bg}` : 'border-white/10 bg-white/5 hover:bg-white/8'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{m.icon}</span>
                <span className={`text-xs font-bold ${sel ? c.text : 'text-gray-300'}`}>{m.name}</span>
              </div>
              <p className="text-xs text-gray-500 leading-tight">{m.desc}</p>
              {sel && (
                <span className={`absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full ${c.badge}`}>
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { MODELS };
