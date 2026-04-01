import React from 'react';
import { autoTune } from '../services/api';

const MODEL_PARAMS = {
  logistic_regression: [
    { key: 'test_size', label: 'Test Size',          type: 'number',  default: 0.2,  min: 0.1,   max: 0.4,  step: 0.05 },
    { key: 'C',         label: 'C (Régularisation)', type: 'number',  default: 1,    min: 0.01,  max: 100,  step: 0.1  },
    { key: 'max_iter',  label: 'Max Itérations',     type: 'number',  default: 100,  min: 50,    max: 1000, step: 50   },
    { key: 'use_smote', label: 'Utiliser SMOTE',     type: 'boolean', default: true  },
  ],
  random_forest: [
    { key: 'test_size',    label: 'Test Size',       type: 'number',  default: 0.2, min: 0.1, max: 0.4, step: 0.05 },
    { key: 'n_estimators', label: "Nbre d'arbres",   type: 'number',  default: 100, min: 10,  max: 500, step: 10   },
    { key: 'max_depth',    label: 'Profondeur max',  type: 'number',  default: 10,  min: 1,   max: 50,  step: 1    },
    { key: 'use_smote',    label: 'Utiliser SMOTE',  type: 'boolean', default: false },
  ],
  svm: [
    { key: 'test_size', label: 'Test Size',          type: 'number', default: 0.2, min: 0.1, max: 0.4, step: 0.05 },
    { key: 'C',         label: 'C (Régularisation)', type: 'number', default: 1,   min: 0.01, max: 100, step: 0.1 },
    { key: 'kernel',    label: 'Kernel',             type: 'select', default: 'rbf', options: ['linear', 'rbf', 'poly', 'sigmoid'] },
    { key: 'use_smote', label: 'Utiliser SMOTE',     type: 'boolean', default: false },
  ],
  knn: [
    { key: 'test_size',   label: 'Test Size',        type: 'number',  default: 0.2, min: 0.1, max: 0.4, step: 0.05 },
    { key: 'n_neighbors', label: 'K Voisins',        type: 'number',  default: 5,   min: 1,   max: 50,  step: 1 },
    { key: 'weights',     label: 'Poids',            type: 'select',  default: 'uniform', options: ['uniform', 'distance'] },
    { key: 'use_smote',   label: 'Utiliser SMOTE',   type: 'boolean', default: false },
  ],
};

const TUNE_METHODS = ['GridSearch', 'RandomSearch', 'Optuna'];

export default function HyperParameters({ modelId, params, onChange, onNotify }) {
  const [tuneMethod, setTuneMethod] = React.useState('GridSearch');
  const [tuning, setTuning]         = React.useState(false);

  const paramDefs = MODEL_PARAMS[modelId] || [];

  const set = (key, value) => onChange({ ...params, [key]: value });

  const handleAutoTune = async () => {
    setTuning(true);
    onNotify(`🔍 Lancement de ${tuneMethod}…`, 'info');
    try {
      const res = await autoTune({ model: modelId, method: tuneMethod });
      onChange({ ...params, ...res.best_params });
      onNotify(`✨ ${tuneMethod} terminé ! Meilleurs paramètres appliqués.`, 'success');
    } catch (err) {
      onNotify(`❌ Tuning échoué : ${err.message}`, 'error');
    } finally {
      setTuning(false);
    }
  };

  if (paramDefs.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
        ⚙️ Hyperparamètres
      </h2>

      <div className="space-y-3">
        {paramDefs.map((p) => {
          const val = params[p.key] !== undefined ? params[p.key] : p.default;

          if (p.type === 'boolean') return (
            <div key={p.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-300">{p.label}</span>
              <div
                onClick={() => set(p.key, !val)}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${val ? 'bg-blue-500' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${val ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>
          );

          if (p.type === 'select') return (
            <div key={p.key}>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400">{p.label}</label>
              </div>
              <select
                value={val}
                onChange={(e) => set(p.key, e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                {p.options.map((o) => <option key={o} value={o} className="bg-gray-900">{o}</option>)}
              </select>
            </div>
          );

          return (
            <div key={p.key}>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400">{p.label}</label>
                <span className="text-xs font-mono text-blue-400">{val}</span>
              </div>
              <input
                type="number"
                min={p.min} max={p.max} step={p.step}
                value={val}
                onChange={(e) => set(p.key, parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          );
        })}
      </div>

      {/* Auto-tune */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-purple-400">🔮 Auto Tuning</p>
        <div className="grid grid-cols-3 gap-2">
          {TUNE_METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setTuneMethod(m)}
              className={`py-1.5 text-xs font-semibold rounded-lg border transition-all
                ${tuneMethod === m
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'}`}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={handleAutoTune}
          disabled={tuning}
          className="w-full py-2 text-sm font-semibold rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {tuning ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Optimisation…
            </>
          ) : `✨ Lancer ${tuneMethod}`}
        </button>
      </div>
    </div>
  );
}

export { MODEL_PARAMS };
