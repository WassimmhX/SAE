export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost/SAE/backend/api').replace(/\/$/, '');

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { success: false, message: text || 'Réponse serveur invalide.' };
  }

  if (!response.ok) {
    const message = data?.message || `Erreur HTTP ${response.status}`;
    const detail = data?.detail ? ` ${data.detail}` : '';
    throw new Error(`${message}${detail}`);
  }

  return data;
}
