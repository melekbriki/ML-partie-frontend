import React, { useState } from 'react';
import { predict } from '../services/api';
import { MODELS } from './ModelSelector';

const FEATURES = [
  { key: 'Status',                label: 'Statut du compte',       min: 1,  max: 4,     step: 1,    default: 1    },
  { key: 'Duration',              label: 'Durée (mois)',            min: 6,  max: 72,    step: 1,    default: 12   },
  { key: 'CreditHistory',         label: 'Historique crédit',       min: 0,  max: 4,     step: 1,    default: 2    },
  { key: 'Purpose',               label: 'Objet du crédit',         min: 0,  max: 10,    step: 1,    default: 3    },
  { key: 'CreditAmount',          label: 'Montant (DM)',            min: 250,max: 20000, step: 50,   default: 2000 },
  { key: 'Savings',               label: 'Épargne',                 min: 1,  max: 5,     step: 1,    default: 1    },
  { key: 'EmploymentDuration',    label: 'Durée emploi',            min: 1,  max: 5,     step: 1,    default: 3    },
  { key: 'InstallmentRate',       label: 'Taux mensualité (%)',     min: 1,  max: 4,     step: 1,    default: 3    },
  { key: 'PersonalStatusSex',     label: 'Statut personnel/Sexe',  min: 1,  max: 5,     step: 1,    default: 1    },
  { key: 'OtherDebtors',          label: 'Autres débiteurs',        min: 1,  max: 3,     step: 1,    default: 1    },
  { key: 'ResidenceDuration',     label: 'Durée résidence',         min: 1,  max: 4,     step: 1,    default: 2    },
  { key: 'Property',              label: 'Propriété',               min: 1,  max: 4,     step: 1,    default: 1    },
  { key: 'Age',                   label: 'Âge (ans)',               min: 19, max: 75,    step: 1,    default: 35   },
  { key: 'OtherInstallmentPlans', label: 'Autres plans',            min: 1,  max: 3,     step: 1,    default: 3    },
  { key: 'Housing',               label: 'Logement',                min: 1,  max: 3,     step: 1,    default: 1    },
  { key: 'ExistingCredits',       label: 'Crédits existants',       min: 1,  max: 4,     step: 1,    default: 1    },
  { key: 'Job',                   label: 'Emploi',                  min: 1,  max: 4,     step: 1,    default: 2    },
  { key: 'PeopleLiable',          label: 'Personnes à charge',      min: 1,  max: 2,     step: 1,    default: 1    },
  { key: 'Telephone',             label: 'Téléphone',               min: 1,  max: 2,     step: 1,    default: 2    },
  { key: 'ForeignWorker',         label: 'Travailleur étranger',    min: 1,  max: 2,     step: 1,    default: 1    },
];

const buildDefault = () => {
  const o = {};
  FEATURES.forEach((f) => { o[f.key] = f.default; });
  return o;
};

const buildRandom = () => {
  const o = {};
  FEATURES.forEach((f) => {
    o[f.key] = Math.round((Math.random() * (f.max - f.min) + f.min) * 10) / 10;
  });
  return o;
};

export default function PredictionPanel({ trainedResults, onNotify }) {
  const [inputs, setInputs]       = useState(buildDefault);
  const [modelId, setModelId]     = useState('');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);

  const modelIds = Object.keys(trainedResults);
  const activeId = modelId || modelIds[0];

  const set = (key, value) => setInputs((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));

  const handlePredict = async () => {
    if (!activeId) { onNotify('⚠️ Entraînez d\'abord un modèle !', 'warning'); return; }
    setLoading(true);
    try {
      const res = await predict({ model_id: activeId, features: inputs });
      setResult(res);
    } catch (err) {
      onNotify(`❌ Prédiction échouée : ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isRisk    = result?.prediction === 1;
  const prob      = result?.risk_probability != null ? (result.risk_probability * 100).toFixed(1) : null;
  const confLabel = prob != null ? (parseFloat(prob) > 75 ? 'Élevée' : parseFloat(prob) > 45 ? 'Moyenne' : 'Faible') : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">🎯 Prédiction</h2>
        <p className="text-xs text-gray-500">Inférence sur un seul demandeur</p>
      </div>

      {/* Model selector */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Modèle entraîné</p>
        {modelIds.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500 bg-white/5 rounded-xl border border-white/10">
            Aucun modèle entraîné — allez sur le Dashboard
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {modelIds.map((mid) => {
              const m   = MODELS.find((x) => x.id === mid);
              const acc = trainedResults[mid]?.accuracy;
              const sel = activeId === mid;
              return (
                <button
                  key={mid}
                  onClick={() => setModelId(mid)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                    ${sel
                      ? 'bg-green-500/10 border-green-500/40 text-green-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'}`}
                >
                  {m?.icon} {m?.name} {acc != null ? `(${acc.toFixed(1)}%)` : ''}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Caractéristiques</p>
          <button
            onClick={() => setInputs(buildRandom())}
            className="text-xs text-gray-400 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
          >
            🎲 Aléatoire
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
          {FEATURES.map((f) => (
            <div key={f.key}>
              <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
              <input
                type="number"
                min={f.min} max={f.max} step={f.step}
                value={inputs[f.key] ?? f.default}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-gray-200 text-xs font-mono rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Predict button */}
      <button
        onClick={handlePredict}
        disabled={loading || modelIds.length === 0}
        className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: loading || modelIds.length === 0
            ? '#1e2130'
            : 'linear-gradient(135deg, #065f46, #10b981)',
          boxShadow: loading ? 'none' : '0 4px 20px rgba(16,185,129,0.25)',
        }}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            Analyse en cours…
          </>
        ) : '⚡ Prédire'}
      </button>

      {/* Result */}
      {result && (
        <div
          className={`rounded-xl border p-5 space-y-3 transition-all ${
            isRisk
              ? 'bg-red-500/8 border-red-500/30'
              : 'bg-green-500/8 border-green-500/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isRisk ? '⚠️' : '✅'}</span>
            <span className={`text-xl font-black ${isRisk ? 'text-red-400' : 'text-green-400'}`}>
              {isRisk ? 'Risque Crédit Détecté' : 'Faible Risque'}
            </span>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Probabilité de risque</p>
              <p className={`text-3xl font-black font-mono mt-0.5 ${isRisk ? 'text-red-400' : 'text-green-400'}`}>{prob}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Confiance</p>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                confLabel === 'Élevée'  ? 'bg-red-500/20 text-red-300' :
                confLabel === 'Moyenne' ? 'bg-yellow-500/20 text-yellow-300' :
                                          'bg-green-500/20 text-green-300'
              }`}>{confLabel}</span>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${prob}%`,
                background: isRisk
                  ? 'linear-gradient(90deg, #ef4444, #f97316)'
                  : 'linear-gradient(90deg, #10b981, #34d399)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
