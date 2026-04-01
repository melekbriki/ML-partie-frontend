import React, { useState } from 'react';
import MetricsCards from './MetricsCards';
import { downloadModel } from '../services/api';
import { MODELS } from './ModelSelector';

const MODEL_COLORS = {
  logistic_regression: { text: 'text-blue-400',   border: 'border-blue-500/40',   bg: 'bg-blue-500/10'   },
  random_forest:       { text: 'text-green-400',  border: 'border-green-500/40',  bg: 'bg-green-500/10'  },
  svm:                 { text: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10' },
  knn:                 { text: 'text-yellow-400', border: 'border-yellow-500/40', bg: 'bg-yellow-500/10' },
};

export default function TrainingResults({ results, onNotify }) {
  const modelIds   = Object.keys(results);
  const [active, setActive] = useState(null);

  const displayId = active || modelIds[modelIds.length - 1];
  const r         = results[displayId];
  const meta      = MODELS.find((m) => m.id === displayId);
  const colors    = MODEL_COLORS[displayId] || MODEL_COLORS.random_forest;

  if (modelIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <span className="text-5xl mb-4">🧪</span>
        <p className="font-semibold text-gray-400">Aucun résultat</p>
        <p className="text-sm mt-1">Entraînez un modèle pour voir les métriques ici</p>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      await downloadModel(displayId);
      onNotify('⬇️ Modèle téléchargé !', 'success');
    } catch {
      onNotify('❌ Échec du téléchargement', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Résultats</h2>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
        >
          ⬇️ Télécharger .pkl
        </button>
      </div>

      {/* Model tabs */}
      {modelIds.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {modelIds.map((mid) => {
            const m   = MODELS.find((x) => x.id === mid);
            const c   = MODEL_COLORS[mid] || MODEL_COLORS.random_forest;
            const sel = mid === displayId;
            return (
              <button
                key={mid}
                onClick={() => setActive(mid)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${sel ? `${c.bg} ${c.border} ${c.text}` : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'}`}
              >
                {m?.icon} {m?.name || mid}
              </button>
            );
          })}
        </div>
      )}

      {/* Active model badge */}
      {meta && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} border ${colors.border}`}>
          <span className="text-lg">{meta.icon}</span>
          <span className={`text-sm font-semibold ${colors.text}`}>{meta.name}</span>
          {r?.accuracy != null && (
            <span className={`ml-auto text-sm font-black font-mono ${colors.text}`}>{r.accuracy.toFixed(1)}%</span>
          )}
        </div>
      )}

      {/* Metrics */}
      <MetricsCards
        results={r ? { ...r, modelId: displayId } : null}
        allResults={results}
      />
    </div>
  );
}
