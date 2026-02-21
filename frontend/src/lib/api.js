const BASE = '/api';

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

  // Admin
  adminStatus: () => request('/admin/status'),
};
