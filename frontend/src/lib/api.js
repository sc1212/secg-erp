// In production on Render, the API is at a separate URL.
// In local dev, Vite proxies /api to localhost:8000.
import { getAuthToken } from './auth';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const token = getAuthToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

async function requestForm(path, formData, options = {}) {
  const token = getAuthToken();
  const res = await fetch(`${BASE}${path}`, {
    method: options.method || 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  login: (usernameOrEmail, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username_or_email: usernameOrEmail, password }),
  }),
  me: () => request('/auth/me'),


  // Operations - Calendar + Daily Logs (Phase 1)
  calendarEvents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/operations/calendar${q ? '?' + q : ''}`);
  },
  createCalendarEvent: (payload) => request('/operations/calendar', { method: 'POST', body: JSON.stringify(payload) }),
  projectDailyLogs: (projectId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/operations/projects/${projectId}/daily-logs${q ? '?' + q : ''}`);
  },
  dailyLogFeed: (days = 7) => request(`/operations/daily-logs/feed?days=${days}`),
  dailyLog: (id) => request(`/operations/daily-logs/${id}`),
  createProjectDailyLog: (projectId, payload) => request(`/operations/projects/${projectId}/daily-logs`, { method: 'POST', body: JSON.stringify(payload) }),
  updateDailyLog: (id, payload) => request(`/operations/daily-logs/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  submitDailyLog: (id) => request(`/operations/daily-logs/${id}/submit`, { method: 'POST' }),


  // Shell
  search: (q, types, limit = 5) => request(`/search?q=${encodeURIComponent(q)}${types ? `&types=${types}` : ''}&limit=${limit}`),
  notifications: (status = 'all', limit = 20) => request(`/notifications?status=${status}&limit=${limit}`),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),


  // Documents
  documents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/documents${q ? '?' + q : ''}`);
  },
  uploadDocument: (file) => {
    const form = new FormData();
    form.append('file', file);
    return requestForm('/documents/upload', form);
  },

  // Dashboard
  dashboard: () => request('/dashboard'),

  // Projects
  projects: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/projects${q ? '?' + q : ''}`);
  },
  project: (id) => request(`/projects/${id}`),
  projectCosts: (id) => request(`/projects/${id}/costs`),
  projectSOV: (id) => request(`/projects/${id}/sov`),
  projectDraws: (id) => request(`/projects/${id}/draws`),
  projectCOs: (id) => request(`/projects/${id}/cos`),
  projectMilestones: (id) => request(`/projects/${id}/milestones`),

  // Financials
  debts: (activeOnly = true) => request(`/financials/debts?active_only=${activeOnly}`),
  pl: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/financials/pl${q ? '?' + q : ''}`);
  },
  plSummary: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/financials/pl/summary${q ? '?' + q : ''}`);
  },
  ar: (status) => request(`/financials/ar${status ? '?status=' + status : ''}`),
  cashForecast: () => request('/financials/cash-forecast'),
  cashForecastWeekly: () => request('/financials/cash-forecast/weekly'),
  retainage: () => request('/financials/retainage'),
  recurring: () => request('/financials/recurring'),
  properties: () => request('/financials/properties'),
  transactions: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/financials/transactions${q ? '?' + q : ''}`);
  },

  // Vendors
  vendors: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/vendors${q ? '?' + q : ''}`);
  },
  vendor: (id) => request(`/vendors/${id}`),
  vendorScorecard: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/vendors/scorecard${q ? '?' + q : ''}`);
  },

  // CRM
  leads: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/crm/leads${q ? '?' + q : ''}`);
  },
  proposals: (status) => request(`/crm/proposals${status ? '?status=' + status : ''}`),
  pipeline: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/crm/pipeline${q ? '?' + q : ''}`);
  },
  pipelineSummary: () => request('/crm/pipeline/summary'),

  // Team
  employees: (activeOnly = true) => request(`/team/employees?active_only=${activeOnly}`),
  payrollCalendar: () => request('/team/payroll-calendar'),
  crewAllocation: (week) => request(`/team/crew-allocation${week ? '?week=' + week : ''}`),
  lienWaivers: () => request('/team/lien-waivers'),
  lienWaiverRisk: () => request('/team/lien-waivers/risk'),

  // Admin
  adminStatus: () => request('/admin/status'),
};
