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

  // Weather
  weatherWeekly: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/weather/weekly${q ? '?' + q : ''}`);
  },
  weatherImpacts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/weather/impacts${q ? '?' + q : ''}`);
  },
  weatherRules: () => request('/weather/rules'),
  createWeatherRule: (data) => request('/weather/rules', { method: 'POST', body: JSON.stringify(data) }),
  weatherRefresh: () => request('/weather/refresh', { method: 'POST' }),

  // Documents
  documents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/documents${q ? '?' + q : ''}`);
  },
  documentTypes: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/documents/types${q ? '?' + q : ''}`);
  },
  documentsExpiring: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/documents/expiring${q ? '?' + q : ''}`);
  },
  document: (id) => request(`/documents/${id}`),
  createDocument: (data) => request('/documents', { method: 'POST', body: JSON.stringify(data) }),
  updateDocument: (id, data) => request(`/documents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Fleet
  fleetVehicles: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/fleet${q ? '?' + q : ''}`);
  },
  fleetVehicle: (id) => request(`/fleet/${id}`),
  createFleetVehicle: (data) => request('/fleet', { method: 'POST', body: JSON.stringify(data) }),
  updateFleetVehicle: (id, data) => request(`/fleet/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  fleetMaintenance: (id) => request(`/fleet/${id}/maintenance`),
  createFleetMaintenance: (id, data) => request(`/fleet/${id}/maintenance`, { method: 'POST', body: JSON.stringify(data) }),
  fleetFuel: (id) => request(`/fleet/${id}/fuel`),
  createFleetFuel: (id, data) => request(`/fleet/${id}/fuel`, { method: 'POST', body: JSON.stringify(data) }),
  fleetAlerts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/fleet/alerts${q ? '?' + q : ''}`);
  },

  // Inventory
  inventoryMaterials: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/inventory/materials${q ? '?' + q : ''}`);
  },
  inventoryMaterial: (id) => request(`/inventory/materials/${id}`),
  createInventoryMaterial: (data) => request('/inventory/materials', { method: 'POST', body: JSON.stringify(data) }),
  inventoryEntries: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/inventory/entries${q ? '?' + q : ''}`);
  },
  inventoryTransactions: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/inventory/transactions${q ? '?' + q : ''}`);
  },
  createInventoryTransaction: (data) => request('/inventory/transactions', { method: 'POST', body: JSON.stringify(data) }),
  inventoryAlerts: () => request('/inventory/alerts'),

  // Safety
  safetyDashboard: () => request('/safety/dashboard'),
  safetyIncidents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/safety/incidents${q ? '?' + q : ''}`);
  },
  createSafetyIncident: (data) => request('/safety/incidents', { method: 'POST', body: JSON.stringify(data) }),
  updateSafetyIncident: (id, status) => request(`/safety/incidents/${id}?status=${status}`, { method: 'PATCH' }),
  toolboxTalks: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/safety/toolbox-talks${q ? '?' + q : ''}`);
  },
  createToolboxTalk: (data) => request('/safety/toolbox-talks', { method: 'POST', body: JSON.stringify(data) }),
  certifications: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/safety/certifications${q ? '?' + q : ''}`);
  },
  createCertification: (data) => request('/safety/certifications', { method: 'POST', body: JSON.stringify(data) }),

  // Warranties
  warranties: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/warranties${q ? '?' + q : ''}`);
  },
  warrantySummary: () => request('/warranties/summary'),
  warranty: (id) => request(`/warranties/${id}`),
  createWarranty: (data) => request('/warranties', { method: 'POST', body: JSON.stringify(data) }),
  updateWarranty: (id, data) => request(`/warranties/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Scorecard
  scorecardPrograms: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/scorecard/programs${q ? '?' + q : ''}`);
  },
  createScorecardProgram: (data) => request('/scorecard/programs', { method: 'POST', body: JSON.stringify(data) }),
  scorecardLeaderboard: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/scorecard/leaderboard${q ? '?' + q : ''}`);
  },
  scorecardScores: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/scorecard/scores${q ? '?' + q : ''}`);
  },

  // Client Portal
  portalClients: () => request('/portal/clients'),
  portalClient: (id) => request(`/portal/clients/${id}`),

  // Morning Briefing
  morningBriefing: () => request('/briefing/today'),

  // Notifications (Phase 0 — real bell icon)
  unreadCount: (userId = 'mike') => request(`/notifications/unread-count?user_id=${userId}`),
  myNotifications: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/notifications${q ? '?' + q : ''}`);
  },
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: (userId = 'mike') => request(`/notifications/read-all?user_id=${encodeURIComponent(userId)}`, { method: 'POST' }),

  // Exception Queue (Phase 0)
  exceptions: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/exceptions${q ? '?' + q : ''}`);
  },
  exceptionsOpenCount: () => request('/exceptions/open-count'),
  resolveException: (id, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/exceptions/${id}/resolve${q ? '?' + q : ''}`, { method: 'POST' });
  },
  assignException: (id, assignedTo) =>
    request(`/exceptions/${id}/assign?assigned_to=${encodeURIComponent(assignedTo)}`, { method: 'POST' }),

  // Approval / Decision Queue (Phase 0)
  approvalQueue: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/approvals/queue${q ? '?' + q : ''}`);
  },
  approveRequest: (id, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/approvals/${id}/approve${q ? '?' + q : ''}`, { method: 'POST' });
  },
  rejectRequest: (id, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/approvals/${id}/reject${q ? '?' + q : ''}`, { method: 'POST' });
  },
  approvalThresholds: () => request('/approvals/thresholds'),

  // Time Clock (Phase 0 / M-25)
  timeclockEntries: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/timeclock/entries${q ? '?' + q : ''}`);
  },
  punchIn: (data) => request('/timeclock/punch-in', { method: 'POST', body: JSON.stringify(data) }),
  punchOut: (id, data = {}) => request(`/timeclock/punch-out/${id}`, { method: 'POST', body: JSON.stringify(data) }),

  // Purchase Orders (Phase 2 / F-7)
  purchaseOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/purchase-orders${q ? '?' + q : ''}`);
  },
  purchaseOrder: (id) => request(`/purchase-orders/${id}`),

  // Draw Requests (Phase 2 / M-17)
  drawRequests: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/draw-requests${q ? '?' + q : ''}`);
  },

  // Permits & Inspections (Phase 3 / M-21)
  permits: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/permits${q ? '?' + q : ''}`);
  },
  permit: (id) => request(`/permits/${id}`),
  createPermit: (data) => request('/permits', { method: 'POST', body: JSON.stringify(data) }),
  upcomingInspections: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/permits/inspections/upcoming${q ? '?' + q : ''}`);
  },

  // Profit Fade Early Warning (Phase 4 / M-15)
  profitFadeDashboard: () => request('/profit-fade/dashboard'),
  projectFadeHistory: (projectId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/profit-fade/projects/${projectId}${q ? '?' + q : ''}`);
  },
  fadeDrivers: (projectId) => request(`/profit-fade/projects/${projectId}/drivers`),
  generateFadeSnapshot: () => request('/profit-fade/generate', { method: 'POST' }),

  // Cash Flow Forecasting (Phase 4 / M-16)
  cashFlowForecast: (scenario = 'expected') => request(`/cash-flow/forecast?scenario=${scenario}`),
  cashRunway: () => request('/cash-flow/runway'),
  generateCashForecast: () => request('/cash-flow/generate', { method: 'POST' }),

  // Admin
  adminStatus: () => request('/admin/status'),
};
