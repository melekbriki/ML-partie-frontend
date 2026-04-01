import React, { useState } from 'react';
import ModelSelector from '../components/ModelSelector';
import HyperParameters, { MODEL_PARAMS } from '../components/HyperParameters';
import TrainingResults from '../components/TrainingResults';
import { trainModel, uploadDataset } from '../services/api';

const buildDefaultParams = () => {
  const init = {};
  Object.entries(MODEL_PARAMS).forEach(([modelId, paramDefs]) => {
    init[modelId] = {};
    paramDefs.forEach((p) => { init[modelId][p.key] = p.default; });
  });
  return init;
};

export default function Dashboard({ allResults, onTrainComplete, onNotify }) {
  const [selectedModels, setSelected] = useState(['random_forest']);
  const [compareMode, setCompareMode] = useState(false);
  const [params, setParams]           = useState(buildDefaultParams);
  const [training, setTraining]       = useState(false);
  const [progress, setProgress]       = useState(0);
  const [savedConfigs, setSaved]      = useState([]);

  const activeModel = selectedModels[selectedModels.length - 1];

  const updateParams = (newParams) =>
    setParams((prev) => ({ ...prev, [activeModel]: newParams }));

  const handleTrain = async () => {
    setTraining(true);
    setProgress(0);
    const tick = setInterval(() => setProgress((p) => Math.min(p + 2, 88)), 180);
    try {
      const newResults = {};
      for (const mid of selectedModels) {
        const res = await trainModel({ model: mid, hyperparams: params[mid] || {} });
        newResults[mid] = res;
      }
      clearInterval(tick);
      setProgress(100);
      onTrainComplete(newResults);
      onNotify(`✅ ${selectedModels.length} modèle(s) entraîné(s) avec succès !`, 'success');
    } catch (err) {
      clearInterval(tick);
      onNotify(`❌ Entraînement échoué : ${err.message}`, 'error');
    } finally {
      setTimeout(() => { setTraining(false); setProgress(0); }, 600);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      await uploadDataset(fd);
      onNotify('📂 Dataset uploadé avec succès !', 'success');
    } catch (err) {
      onNotify(`❌ Upload échoué : ${err.message}`, 'error');
    }
  };

  const saveConfig = () => {
    const name = `${activeModel} — ${new Date().toLocaleTimeString()}`;
    setSaved((prev) => [{ name, model: activeModel, params: { ...params[activeModel] } }, ...prev]);
    onNotify('💾 Configuration sauvegardée !', 'success');
  };

  const loadConfig = (cfg) => {
    setParams((prev) => ({ ...prev, [cfg.model]: cfg.params }));
    onNotify('📂 Configuration chargée !', 'info');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Left: Train ──────────────────────────────────────────────────── */}
      <div className="bg-gray-900/60 border border-white/8 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg">🤖</div>
          <div>
            <h1 className="font-bold text-base text-white">Entraîner un modèle</h1>
            <p className="text-xs text-gray-500">Configurez votre détecteur de risque crédit</p>
          </div>
        </div>

        <ModelSelector
          selected={selectedModels}
          onChange={setSelected}
          compareMode={compareMode}
          onCompareModeChange={setCompareMode}
        />

        <HyperParameters
          modelId={activeModel}
          params={params[activeModel] || {}}
          onChange={updateParams}
          onNotify={onNotify}
        />

        {/* Save / Upload */}
        <div className="flex gap-2">
          <button
            onClick={saveConfig}
            className="flex-1 py-2 text-xs font-semibold rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
          >
            💾 Sauvegarder config
          </button>
          <label className="flex-1 py-2 text-xs font-semibold rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
            📂 Uploader CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleUpload} />
          </label>
        </div>

        {/* Saved configs */}
        {savedConfigs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Configs sauvegardées</p>
            {savedConfigs.slice(0, 3).map((cfg, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                <span className="text-xs text-gray-400 truncate">{cfg.name}</span>
                <button onClick={() => loadConfig(cfg)} className="text-xs text-blue-400 hover:text-blue-300 ml-2 flex-shrink-0">
                  Charger →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {training && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Entraînement de {selectedModels.length} modèle(s)…</span>
              <span className="font-mono text-blue-400">{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #2563eb, #8b5cf6)',
                }}
              />
            </div>
          </div>
        )}

        {/* Train button */}
        <button
          onClick={handleTrain}
          disabled={training}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: training ? '#1e2130' : 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
            boxShadow: training ? 'none' : '0 4px 24px rgba(59,130,246,0.35)',
          }}
        >
          {training ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Entraînement…
            </>
          ) : '▶ Entraîner le modèle'}
        </button>
      </div>

      {/* ── Right: Results ───────────────────────────────────────────────── */}
      <div className="bg-gray-900/60 border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center text-lg">📊</div>
          <div>
            <h1 className="font-bold text-base text-white">Résultats</h1>
            <p className="text-xs text-gray-500">Métriques, matrice de confusion, courbe ROC</p>
          </div>
        </div>
        <TrainingResults results={allResults} onNotify={onNotify} />
      </div>

    </div>
  );
}
