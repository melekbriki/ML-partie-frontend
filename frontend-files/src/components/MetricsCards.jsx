import React, { useState } from 'react';

const METRIC_CONFIG = [
  { key: 'accuracy',  label: 'Accuracy',  color: 'text-blue-400',   border: 'border-blue-500/30',   bg: 'bg-blue-500/10',   icon: '🎯' },
  { key: 'f1',        label: 'F1 Score',  color: 'text-green-400',  border: 'border-green-500/30',  bg: 'bg-green-500/10',  icon: '📈' },
  { key: 'roc_auc',   label: 'ROC AUC',   color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', icon: '📉' },
  { key: 'precision', label: 'Précision', color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', icon: '🔬' },
  { key: 'recall',    label: 'Recall',    color: 'text-red-400',    border: 'border-red-500/30',    bg: 'bg-red-500/10',    icon: '🔍' },
];

// ── Confusion Matrix ──────────────────────────────────────────────────────────
function ConfusionMatrix({ tn = 0, fp = 0, fn = 0, tp = 0 }) {
  const cells = [
    { val: tn, label: 'Vrai Négatif',  abbr: 'TN', color: 'text-green-400',  border: 'border-green-500/30',  bg: 'bg-green-500/10'  },
    { val: fp, label: 'Faux Positif',  abbr: 'FP', color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' },
    { val: fn, label: 'Faux Négatif',  abbr: 'FN', color: 'text-red-400',    border: 'border-red-500/30',    bg: 'bg-red-500/10'    },
    { val: tp, label: 'Vrai Positif',  abbr: 'TP', color: 'text-blue-400',   border: 'border-blue-500/30',   bg: 'bg-blue-500/10'   },
  ];
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Matrice de Confusion</p>
      <div className="grid grid-cols-2 gap-2">
        {cells.map(({ val, label, abbr, color, border, bg }) => (
          <div key={abbr} className={`${bg} border ${border} rounded-xl p-3 text-center`}>
            <div className={`text-2xl font-black font-mono ${color}`}>{val.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{abbr} · {label}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/>Prédit: Pas de risque</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>Prédit: Risque</span>
      </div>
    </div>
  );
}

// ── Mini ROC Curve SVG ─────────────────────────────────────────────────────────
function RocCurve({ modelId, rocAuc, points }) {
  const CURVES = {
    logistic_regression: [[0,0],[0.025,0.92],[0.05,0.95],[0.1,0.97],[0.2,0.98],[0.5,0.99],[1,1]],
    random_forest:       [[0,0],[0.01,0.95],[0.03,0.98],[0.05,0.99],[0.1,0.995],[0.3,0.999],[1,1]],
    svm:                 [[0,0],[0.01,0.93],[0.03,0.97],[0.05,0.98],[0.1,0.99],[0.3,0.998],[1,1]],
    knn:                 [[0,0],[0.03,0.85],[0.06,0.9],[0.1,0.93],[0.2,0.96],[0.5,0.98],[1,1]],
  };
  const W = 260, H = 170, PL = 32, PR = 10, PT = 10, PB = 28;
  const IW = W - PL - PR, IH = H - PT - PB;
  const tx = (x) => PL + x * IW;
  const ty = (y) => PT + (1 - y) * IH;
  const pts = points || CURVES[modelId] || CURVES.random_forest;
  const d   = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${tx(p[0]).toFixed(1)},${ty(p[1]).toFixed(1)}`).join(' ');
  const fill = d + ` L${tx(1).toFixed(1)},${ty(0).toFixed(1)} L${tx(0).toFixed(1)},${ty(0).toFixed(1)} Z`;

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Courbe ROC</p>
      <svg width={W} height={H} className="overflow-visible">
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02"/>
          </linearGradient>
        </defs>
        {[0.2,0.4,0.6,0.8].map(v => (
          <g key={v}>
            <line x1={tx(0)} y1={ty(v)} x2={tx(1)} y2={ty(v)} stroke="#ffffff0a"/>
            <line x1={tx(v)} y1={ty(0)} x2={tx(v)} y2={ty(1)} stroke="#ffffff0a"/>
            <text x={PL-4} y={ty(v)+3} textAnchor="end" fill="#4b5563" fontSize="8">{v}</text>
            <text x={tx(v)} y={H-4}    textAnchor="middle" fill="#4b5563" fontSize="8">{v}</text>
          </g>
        ))}
        <line x1={tx(0)} y1={ty(0)} x2={tx(1)} y2={ty(1)} stroke="#ffffff15" strokeDasharray="4,4"/>
        <path d={fill} fill="url(#rg)"/>
        <path d={d} stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinejoin="round"/>
        <line x1={tx(0)} y1={ty(0)} x2={tx(1)} y2={ty(0)} stroke="#ffffff15"/>
        <line x1={tx(0)} y1={ty(0)} x2={tx(0)} y2={ty(1)} stroke="#ffffff15"/>
        <text x={tx(0.5)} y={H} textAnchor="middle" fill="#4b5563" fontSize="9">Taux Faux Positifs</text>
        <text x={10} y={ty(0.5)} textAnchor="middle" fill="#4b5563" fontSize="9" transform={`rotate(-90,10,${ty(0.5)})`}>TPR</text>
        {rocAuc && <text x={tx(0.55)} y={ty(0.15)} fill="#60a5fa" fontSize="11" fontWeight="bold">AUC = {rocAuc}</text>}
      </svg>
    </div>
  );
}

// ── Comparison bars ───────────────────────────────────────────────────────────
const MODEL_COLORS = {
  logistic_regression: '#3b82f6',
  random_forest:       '#10b981',
  svm:                 '#8b5cf6',
  knn:                 '#f59e0b',
};
const MODEL_SHORT = { logistic_regression: 'LR', random_forest: 'RF', svm: 'SVM', knn: 'KNN' };

function ComparisonChart({ results }) {
  const models = Object.keys(results);
  if (models.length < 2) return <p className="text-sm text-gray-500 text-center py-4">Entraînez au moins 2 modèles pour comparer</p>;

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Comparaison des modèles</p>
      <div className="flex gap-4 mb-4 flex-wrap">
        {models.map((m) => (
          <span key={m} className="flex items-center gap-1.5 text-xs" style={{ color: MODEL_COLORS[m] }}>
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: MODEL_COLORS[m] }}/>
            {MODEL_SHORT[m] || m}
          </span>
        ))}
      </div>
      {['accuracy','f1','roc_auc','precision','recall'].map((metric) => (
        <div key={metric} className="mb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{metric.replace('_',' ')}</p>
          <div className="flex gap-1.5">
            {models.map((m) => {
              const val = results[m]?.[metric] ?? 0;
              return (
                <div key={m} className="flex-1">
                  <div className="relative h-6 bg-white/5 rounded overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded transition-all duration-700"
                      style={{ width: `${val}%`, background: MODEL_COLORS[m], opacity: 0.8 }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white" style={{ fontSize: 9 }}>
                      {val.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-center text-gray-500 mt-0.5" style={{ fontSize: 9 }}>{MODEL_SHORT[m]}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main MetricsCards export ──────────────────────────────────────────────────
export default function MetricsCards({ results, allResults }) {
  const [tab, setTab] = useState('metrics');
  const tabs = ['metrics', 'confusion', 'roc', 'comparer'];

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <span className="text-5xl mb-4">🧪</span>
        <p className="font-semibold text-gray-400">Aucun résultat</p>
        <p className="text-sm mt-1">Entraînez un modèle pour voir les métriques</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all
              ${tab === t ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-gray-200'}`}
          >
            {t === 'confusion' ? 'Matrice' : t === 'comparer' ? 'Comparer' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Metrics */}
      {tab === 'metrics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {METRIC_CONFIG.map(({ key, label, color, border, bg, icon }) => (
              <div key={key} className={`${bg} border ${border} rounded-xl p-3 text-center`}>
                <div className="text-lg mb-1">{icon}</div>
                <div className={`text-2xl font-black font-mono ${color}`}>
                  {results[key] != null ? `${results[key].toFixed(1)}%` : '—'}
                </div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
          {results.training_time != null && (
            <p className="text-xs text-gray-500">⏱ Temps d'entraînement : <span className="text-gray-300">{results.training_time.toFixed(2)}s</span></p>
          )}
        </div>
      )}

      {/* Confusion */}
      {tab === 'confusion' && (
        <ConfusionMatrix tn={results.tn} fp={results.fp} fn={results.fn} tp={results.tp} />
      )}

      {/* ROC */}
      {tab === 'roc' && (
        <RocCurve modelId={results.modelId} rocAuc={results.roc_auc?.toFixed(2)} points={results.roc_points} />
      )}

      {/* Compare */}
      {tab === 'comparer' && (
        <ComparisonChart results={allResults || {}} />
      )}
    </div>
  );
}
