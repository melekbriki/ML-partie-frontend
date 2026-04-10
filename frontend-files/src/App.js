import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import PredictionPanel from './components/PredictionPanel';
import { ping, getHistory } from './services/api';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: 'bg-green-950 border-green-500/40 text-green-300',
    error:   'bg-red-950   border-red-500/40   text-red-300',
    info:    'bg-blue-950  border-blue-500/40  text-blue-300',
    warning: 'bg-yellow-950 border-yellow-500/40 text-yellow-300',
  };

  return (
    <div
      onClick={onClose}
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl cursor-pointer max-w-sm animate-[fadeIn_0.3s_ease] ${styles[type] || styles.success}`}
    >
      {message}
    </div>
  );
}

// ── MLflow Button ─────────────────────────────────────────────────────────────
function MLflowButton({ runId, onNotify }) {
  const [loading, setLoading] = useState(false);

  const openMlflow = async () => {
    if (!runId) {
      window.open('http://localhost:5000', '_blank');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/mlflow/run/${runId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      window.open(data.mlflow_url || 'http://localhost:5000', '_blank');
    } catch {
      window.open('http://localhost:5000', '_blank');
      onNotify('🔬 Ouverture de MLflow UI — cherchez le run manuellement', 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={openMlflow}
      disabled={loading}
      title="Voir dans MLflow UI"
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 transition-all disabled:opacity-50"
    >
      {loading ? (
        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      ) : '🔬'} MLflow
    </button>
  );
}

// ── History page ──────────────────────────────────────────────────────────────
function HistoryPage({ onNotify }) {
  const [runs, setRuns]    = useState([]);
  const [loading, setLoad] = useState(true);
  const [open, setOpen]    = useState(null);

  useEffect(() => {
    getHistory()
      .then((data) => setRuns(Array.isArray(data) ? data : data?.runs || []))
      .catch(() => onNotify('⚠️ Impossible de charger l\'historique', 'warning'))
      .finally(() => setLoad(false));
  }, []);

  const MODEL_ICON  = { logistic_regression: '⚡', random_forest: '🌲', svm: '🔷', knn: '🎯' };
  const MODEL_NAME  = { logistic_regression: 'Logistic Regression', random_forest: 'Random Forest', svm: 'SVM', knn: 'KNN' };
  const MODEL_COLOR = {
    logistic_regression: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    random_forest:       'text-green-400 bg-green-500/10 border-green-500/30',
    svm:                 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    knn:                 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      Chargement de l'historique…
    </div>
  );

  if (runs.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <span className="text-5xl mb-4">📋</span>
      <p className="font-semibold text-gray-400">Aucune expérience</p>
      <p className="text-sm mt-1">Entraînez des modèles pour remplir l'historique</p>
    </div>
  );

  return (
    <div className="space-y-4">

      {/* ── En-tête avec bouton MLflow global ── */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Historique des expériences</h2>
          <p className="text-sm text-gray-500 mt-1">{runs.length} run(s) enregistré(s)</p>
        </div>

        {/* Bouton global : ouvre MLflow UI (liste de tous les runs) */}
        <button
          onClick={() => window.open('http://localhost:5000', '_blank')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-300 text-sm font-semibold hover:bg-orange-500/20 transition-all"
        >
          🔬 Ouvrir MLflow UI
        </button>
      </div>

      {/* ── Liste des runs ── */}
      {runs.map((run, i) => {
        const colors = MODEL_COLOR[run.model] || MODEL_COLOR.random_forest;
        const isOpen = open === i;
        return (
          <div key={run.id || i} className={`bg-gray-900/60 rounded-2xl border transition-all ${isOpen ? 'border-white/15' : 'border-white/8'}`}>

            {/* Row principale */}
            <div
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex items-center gap-4 p-4 cursor-pointer flex-wrap"
            >
              <span className="text-2xl">{MODEL_ICON[run.model] || '🤖'}</span>
              <div className="flex-1 min-w-32">
                <p className="font-semibold text-white text-sm">{MODEL_NAME[run.model] || run.model}</p>
                <p className="text-xs text-gray-500">{run.date || '—'}</p>
              </div>
              <div className="flex gap-5">
                {[['Acc', run.accuracy], ['F1', run.f1], ['AUC', run.roc_auc]].map(([label, val]) =>
                  val != null ? (
                    <div key={label} className="text-center">
                      <p className={`text-base font-black font-mono ${colors.split(' ')[0]}`}>{val.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  ) : null
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${colors}`}>
                {(run.id || `run-${i + 1}`).slice(0, 8)}
              </span>
              <span className="text-gray-600 text-sm">{isOpen ? '▲' : '▼'}</span>
            </div>

            {/* Panneau déroulant */}
            {isOpen && (
              <div className="border-t border-white/8 p-4 bg-black/20 rounded-b-2xl space-y-4">

                {/* Hyperparamètres */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Hyperparamètres</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(run.params || {}).map(([k, v]) => (
                      <span key={k} className="text-xs px-2 py-1 bg-white/5 rounded-lg text-gray-400">
                        <span className="text-gray-600">{k}: </span>
                        <span className={`font-mono ${colors.split(' ')[0]}`}>{String(v)}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1">

                  {/* ── Bouton MLflow par run ── */}
                  <MLflowButton runId={run.id} onNotify={onNotify} />

                  {/* Rollback */}
                  <button
                    onClick={() => onNotify('🔄 Rollback — implémentez POST /rollback sur le backend', 'info')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all ${colors}`}
                  >
                    🔄 Rollback vers cette version
                  </button>
                </div>

                {/* Lien MLflow run ID si disponible */}
                {run.mlflow_run_id && (
                  <p className="text-xs text-gray-600 font-mono">
                    MLflow run ID : <span className="text-orange-400/70">{run.mlflow_run_id}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', label: 'Dashboard',  icon: '⚡' },
  { id: 'predict',   label: 'Prédiction', icon: '🎯' },
  { id: 'history',   label: 'Historique', icon: '📋' },
];

export default function App() {
  const [page, setPage]           = useState('dashboard');
  const [allResults, setResults]  = useState({});
  const [toast, setToast]         = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    ping()
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('error'));
  }, []);

  const notify = (msg, type = 'success') => setToast({ msg, type });

  const handleTrainComplete = (results) =>
    setResults((prev) => ({ ...prev, ...results }));

  return (
    <div className="min-h-screen bg-[#080a0f] text-gray-100" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 3px; }
      `}</style>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/8 backdrop-blur-md bg-[#080a0f]/90 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)' }}>
            🏦
          </div>
          <span className="font-extrabold text-base tracking-tight">CreditGuard</span>
          <span className="text-xs text-gray-600 uppercase tracking-widest hidden sm:block">ML Platform</span>
        </div>

        <nav className="flex gap-1">
          {NAV.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all border
                ${page === id
                  ? 'bg-blue-500/15 border-blue-500/35 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {icon} {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${
            apiStatus === 'ok'    ? 'bg-green-500 animate-pulse' :
            apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className={
            apiStatus === 'ok'    ? 'text-green-400' :
            apiStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
          }>
            {apiStatus === 'ok' ? 'API Connectée' : apiStatus === 'error' ? 'API Hors ligne' : 'Connexion…'}
          </span>
        </div>
      </header>

      {/* ── Page ────────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {page === 'dashboard' && (
          <Dashboard
            allResults={allResults}
            onTrainComplete={handleTrainComplete}
            onNotify={notify}
          />
        )}

        {page === 'predict' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900/60 border border-white/8 rounded-2xl p-6">
              <PredictionPanel trainedResults={allResults} onNotify={notify} />
            </div>
          </div>
        )}

        {page === 'history' && (
          <HistoryPage onNotify={notify} />
        )}
      </main>
    </div>
  );
}