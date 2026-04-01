const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Erreur serveur');
  }
  return res.json();
};

// ── Health ────────────────────────────────────────────────────────────────────
export const ping = () =>
  fetch(`${BASE_URL}/`).then(handleResponse);

// ── Train ─────────────────────────────────────────────────────────────────────
// payload: { model: string, hyperparams: object }
export const trainModel = (payload) =>
  fetch(`${BASE_URL}/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleResponse);

// ── Results ───────────────────────────────────────────────────────────────────
export const getResults = (modelId) =>
  fetch(`${BASE_URL}/results?model_id=${modelId}`).then(handleResponse);

// ── Models list ───────────────────────────────────────────────────────────────
export const listModels = () =>
  fetch(`${BASE_URL}/models`).then(handleResponse);

// ── Predict ───────────────────────────────────────────────────────────────────
// payload: { model_id: string, features: CreditData }
export const predict = (payload) =>
  fetch(`${BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleResponse);

// ── Auto-tune ─────────────────────────────────────────────────────────────────
// payload: { model: string, method: "GridSearch"|"RandomSearch"|"Optuna" }
export const autoTune = (payload) =>
  fetch(`${BASE_URL}/tune`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleResponse);

// ── Upload CSV ────────────────────────────────────────────────────────────────
export const uploadDataset = (formData) =>
  fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  }).then(handleResponse);

// ── History ───────────────────────────────────────────────────────────────────
export const getHistory = () =>
  fetch(`${BASE_URL}/history`).then(handleResponse);

// ── Download model .pkl ───────────────────────────────────────────────────────
export const downloadModel = async (modelId) => {
  const res = await fetch(`${BASE_URL}/download?model_id=${modelId}`);
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${modelId}_model.pkl`;
  a.click();
  URL.revokeObjectURL(url);
};
