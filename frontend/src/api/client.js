const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const SESSION_EXPIRED_EVENT = 'belleart:session-expired';

export function clearStoredSession() {
  localStorage.removeItem('belleart_token');
  localStorage.removeItem('belleart_user');
}

function notifySessionExpired() {
  clearStoredSession();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export function onSessionExpired(callback) {
  window.addEventListener(SESSION_EXPIRED_EVENT, callback);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, callback);
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('belleart_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const data = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      notifySessionExpired();
    }

    throw new Error(data?.error || 'Erro na comunicação com a API.');
  }

  return data;
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
};
