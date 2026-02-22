// In production on Render, the API is at a separate URL.
// In local dev, Vite proxies /api to localhost:8000.
const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
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

  // Calendar
  calendarEvents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/calendar${q ? '?' + q : ''}`);
  },
  calendarEvent: (id) => request(`/calendar/${id}`),
  createCalendarEvent: (data) => request('/calendar', { method: 'POST', body: JSON.stringify(data) }),
  updateCalendarEvent: (id, data) => request(`/calendar/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCalendarEvent: (id) => request(`/calendar/${id}`, { method: 'DELETE' }),
  crewBoard: (week) => request(`/calendar/crew-board${week ? '?week=' + week : ''}`),

  // Daily Logs
  dailyLogFeed: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/daily-logs/feed${q ? '?' + q : ''}`);
  },
  dailyLogTodayStatus: () => request('/daily-logs/today-status'),
  projectDailyLogs: (projectId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/daily-logs/project/${projectId}${q ? '?' + q : ''}`);
  },
  dailyLog: (id) => request(`/daily-logs/${id}`),
  createDailyLog: (data) => request('/daily-logs', { method: 'POST', body: JSON.stringify(data) }),
  updateDailyLog: (id, data) => request(`/daily-logs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  submitDailyLog: (id) => request(`/daily-logs/${id}/submit`, { method: 'POST' }),
  reviewDailyLog: (id, reviewerId) => request(`/daily-logs/${id}/review?reviewer_id=${reviewerId}`, { method: 'POST' }),

  // Admin
  adminStatus: () => request('/admin/status'),
};
