const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('belleart_token');
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) { if (response.status === 401 && path !== '/auth/login') localStorage.removeItem('belleart_token'); throw new Error(data.error || 'Erro na comunicação com a API.'); }
  return data;
}
export const api = { get: (path) => apiRequest(path), post: (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) }), put: (path, body) => apiRequest(path, { method: 'PUT', body: JSON.stringify(body) }), delete: (path) => apiRequest(path, { method: 'DELETE' }) };
