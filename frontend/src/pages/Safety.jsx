export default function Safety() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Safety</h1>
      <div className="bg-brand-card border border-brand-border rounded-lg p-4">
        <div className="text-sm">Days since last incident: <span className="font-semibold text-ok">47</span></div>
        <div className="text-xs text-brand-muted mt-1">Certification expiry and toolbox talks feed this center.</div>
import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { shortDate, money } from '../lib/format';
import { PageLoading, ErrorState } from '../components/LoadingState';
import DemoBanner from '../components/DemoBanner';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Award,
  Users,
  Clock,
  CheckCircle,
  Search,
  Flame,
  HardHat,
  Ban,
  Zap,
} from 'lucide-react';

/* ── Demo Data ─────────────────────────────────────────────────────────── */

const demoDashboard = {
  days_since_incident: 47,
  open_incidents: 2,
  total_incidents_ytd: 8,
  toolbox_talks_this_month: 6,
  expiring_certifications: 3,
};

const demoIncidents = [
  {
    id: 1,
    project_id: 1,
    reported_by: 'Mike Sullivan',
    incident_date: '2026-01-06',
    incident_type: 'near_miss',
    severity: 'low',
    description: 'Unsecured ladder slid on wet concrete near south foundation wall. No injuries.',
    root_cause: 'Ladder feet not cleaned; no spotter assigned.',
    corrective_action: 'Mandatory ladder inspection before each use. Spotter required on wet surfaces.',
    status: 'closed',
    osha_recordable: false,
    days_lost: 0,
    photos: 2,
  },
  {
    id: 2,
    project_id: 2,
    reported_by: 'Jake Torres',
    incident_date: '2026-01-22',
    incident_type: 'first_aid',
    severity: 'medium',
    description: 'Carpenter received minor laceration on left hand from circular saw kickback during rip cut.',
    root_cause: 'Dull blade not replaced per schedule; improper material support.',
    corrective_action: 'Blade replacement log enforced. Material support jig required for rip cuts > 4 ft.',
    status: 'closed',
    osha_recordable: false,
    days_lost: 0,
    photos: 3,
  },
  {
    id: 3,
    project_id: 1,
    reported_by: 'Derek Hall',
    incident_date: '2026-02-03',
    incident_type: 'recordable',
    severity: 'high',
    description: 'Electrician stepped on exposed nail penetrating boot sole. Tetanus shot administered at urgent care.',
    root_cause: 'Debris not cleared from work area; steel-toe boots did not have puncture-resistant soles.',
    corrective_action: 'Puncture-resistant insoles mandatory. End-of-day debris sweep added to daily log checklist.',
    status: 'corrective_action',
    osha_recordable: true,
    days_lost: 1,
    photos: 5,
  },
  {
    id: 4,
    project_id: 3,
    reported_by: 'Chris Taylor',
    incident_date: '2026-02-10',
    incident_type: 'property_damage',
    severity: 'medium',
    description: 'Skid steer bucket struck underground water line during grading. Line repaired same day.',
    root_cause: 'Utility locate markings faded after rain; operator did not request re-mark.',
    corrective_action: 'Re-locate required after any precipitation > 0.5 in. Operator pre-dig checklist updated.',
    status: 'investigating',
    osha_recordable: false,
    days_lost: 0,
    photos: 8,
  },
  {
    id: 5,
    project_id: 2,
    reported_by: 'Mike Sullivan',
    incident_date: '2026-02-18',
    incident_type: 'near_miss',
    severity: 'low',
    description: 'Unsecured sheet of plywood blown off 2nd-floor deck by wind gust. Landed in fenced exclusion zone.',
    root_cause: 'Materials not weighted or tied down during high-wind advisory.',
    corrective_action: 'Wind speed protocol: all loose materials secured when gusts exceed 25 mph.',
    status: 'open',
    osha_recordable: false,
    days_lost: 0,
    photos: 1,
  },
];

const demoToolboxTalks = [
  {
    id: 1,
    project_id: 1,
    conducted_by: 'Mike Sullivan',
    conducted_date: '2026-02-03',
    topic: 'Fall Protection & Harness Inspection',
    attendees: 12,
    duration_minutes: 25,
    notes: 'Reviewed proper harness fit, lanyard inspection points, and anchor requirements for roof work beginning next week.',
  },
  {
    id: 2,
    project_id: 2,
    conducted_by: 'Jake Torres',
    conducted_date: '2026-02-05',
    topic: 'Trenching & Excavation Safety',
    attendees: 8,
    duration_minutes: 20,
    notes: 'Covered soil classification, sloping requirements, and protective systems. Reminded crew of cave-in hazard protocols.',
  },
  {
    id: 3,
    project_id: 1,
    conducted_by: 'Derek Hall',
    conducted_date: '2026-02-10',
    topic: 'Electrical Safety — Lock Out / Tag Out',
    attendees: 10,
    duration_minutes: 30,
    notes: 'Demonstrated LOTO procedures for panel work. Each crew member practiced applying locks and tags.',
  },
  {
    id: 4,
    project_id: 3,
    conducted_by: 'Chris Taylor',
    conducted_date: '2026-02-12',
    topic: 'Heat Illness Prevention',
    attendees: 15,
    duration_minutes: 15,
    notes: 'Early season reminder on hydration, shade breaks, and recognizing heat exhaustion symptoms.',
  },
  {
    id: 5,
    project_id: 2,
    conducted_by: 'Mike Sullivan',
    conducted_date: '2026-02-17',
    topic: 'Scaffold Erection & Inspection',
    attendees: 9,
    duration_minutes: 35,
    notes: 'Walked through competent person checklist, base plate leveling, and daily inspection tags.',
  },
  {
    id: 6,
    project_id: 1,
    conducted_by: 'Jake Torres',
    conducted_date: '2026-02-19',
    topic: 'PPE Compliance & Housekeeping',
    attendees: 14,
    duration_minutes: 20,
    notes: 'Reinforced hard hat, safety glasses, and high-vis vest requirements. Reviewed clean work area expectations.',
  },
];

const demoCertifications = [
  {
    id: 1,
    employee_id: 1,
    employee_name: 'Mike Sullivan',
    cert_type: 'OSHA 30-Hour Construction',
    cert_number: 'OSHA-30-88421',
    issued_date: '2024-03-15',
    expiry_date: '2029-03-15',
    status: 'active',
  },
  {
    id: 2,
    employee_id: 2,
    employee_name: 'Jake Torres',
    cert_type: 'OSHA 10-Hour Construction',
    cert_number: 'OSHA-10-77205',
    issued_date: '2023-06-01',
    expiry_date: '2028-06-01',
    status: 'active',
  },
  {
    id: 3,
    employee_id: 3,
    employee_name: 'Derek Hall',
    cert_type: 'Certified Rigger — NCCCO',
    cert_number: 'NCCCO-R-41982',
    issued_date: '2021-09-20',
    expiry_date: '2026-09-20',
    status: 'active',
  },
  {
    id: 4,
    employee_id: 4,
    employee_name: 'Chris Taylor',
    cert_type: 'First Aid / CPR / AED',
    cert_number: 'ARC-FA-20458',
    issued_date: '2024-04-10',
    expiry_date: '2026-04-10',
    status: 'pending_renewal',
  },
  {
    id: 5,
    employee_id: 5,
    employee_name: 'Ryan Mitchell',
    cert_type: 'Confined Space Entry',
    cert_number: 'CSE-TN-30891',
    issued_date: '2023-01-12',
    expiry_date: '2026-01-12',
    status: 'expired',
  },
  {
    id: 6,
    employee_id: 1,
    employee_name: 'Mike Sullivan',
    cert_type: 'Competent Person — Excavation',
    cert_number: 'CPE-TN-12044',
    issued_date: '2022-11-05',
    expiry_date: '2026-03-05',
    status: 'pending_renewal',
  },
  {
    id: 7,
    employee_id: 6,
    employee_name: 'Brandon Lewis',
    cert_type: 'Forklift Operator',
    cert_number: 'FORK-TN-66230',
    issued_date: '2023-08-18',
    expiry_date: '2026-08-18',
    status: 'active',
  },
];

/* ── Helpers ──────────────────────────────────────────────────────────── */

const INCIDENT_STATUS_STYLES = {
  open:              { bg: 'var(--status-loss-bg)',    color: 'var(--status-loss)' },
  investigating:     { bg: 'var(--status-warning-bg)', color: 'var(--status-warning)' },
  corrective_action: { bg: 'var(--accent-bg)',         color: 'var(--accent)' },
  closed:            { bg: 'var(--status-profit-bg)',  color: 'var(--status-profit)' },
};

const INCIDENT_TYPE_LABELS = {
  near_miss:        'Near Miss',
  first_aid:        'First Aid',
  recordable:       'Recordable',
  lost_time:        'Lost Time',
  property_damage:  'Property Damage',
};

const INCIDENT_TYPE_ICONS = {
  near_miss:        AlertTriangle,
  first_aid:        ShieldCheck,
  recordable:       Flame,
  lost_time:        Ban,
  property_damage:  Zap,
};

const SEVERITY_STYLES = {
  low:    { bg: 'var(--status-profit-bg)',  color: 'var(--status-profit)' },
  medium: { bg: 'var(--status-warning-bg)', color: 'var(--status-warning)' },
  high:   { bg: 'var(--status-loss-bg)',    color: 'var(--status-loss)' },
  critical: { bg: 'color-mix(in srgb, var(--status-loss) 15%, transparent)', color: 'var(--status-loss)' },
};

const CERT_STATUS_STYLES = {
  active:          { bg: 'var(--status-profit-bg)',  color: 'var(--status-profit)' },
  expired:         { bg: 'var(--status-loss-bg)',    color: 'var(--status-loss)' },
  pending_renewal: { bg: 'var(--status-warning-bg)', color: 'var(--status-warning)' },
};

const CERT_STATUS_LABELS = {
  active:          'Active',
  expired:         'Expired',
  pending_renewal: 'Pending Renewal',
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

/* ── Tabs ───────────────────────────────────────────────────────────────── */

const TABS = [
  { key: 'incidents',      label: 'Incidents',      icon: AlertTriangle },
  { key: 'toolbox_talks',  label: 'Toolbox Talks',  icon: Users },
  { key: 'certifications', label: 'Certifications', icon: Award },
];

/* ── KPI Card ───────────────────────────────────────────────────────────── */

function KpiCard({ icon: Icon, label, value, accent }) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color: accent ? 'var(--status-loss)' : 'var(--accent)' }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </span>
      </div>
      <div className="text-xl font-bold num" style={{ color: accent ? 'var(--status-loss)' : 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */

export default function Safety() {
  const [activeTab, setActiveTab] = useState('incidents');

  // API calls
  const { data: dashboardData, loading, error, isDemo } = useApi(
    () => api.safetyDashboard(),
    []
  );
  const { data: incidentsData } = useApi(() => api.safetyIncidents({}), []);
  const { data: talksData } = useApi(() => api.toolboxTalks({}), []);
  const { data: certsData } = useApi(() => api.certifications({}), []);

  const dashboard = dashboardData || demoDashboard;
  const incidents = incidentsData || (loading ? [] : demoIncidents);
  const talks = talksData || (loading ? [] : demoToolboxTalks);
  const certs = certsData || (loading ? [] : demoCertifications);

  if (loading) return <PageLoading />;
  if (error && !incidents.length) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Safety &amp; Compliance</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Incident tracking, toolbox talks, and certification management
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <AlertTriangle size={14} /> Report Incident
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          icon={ShieldCheck}
          label="Days Since Incident"
          value={dashboard.days_since_incident}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Open Incidents"
          value={dashboard.open_incidents}
          accent={dashboard.open_incidents > 0}
        />
        <KpiCard
          icon={FileText}
          label="YTD Incidents"
          value={dashboard.total_incidents_ytd}
        />
        <KpiCard
          icon={Users}
          label="Talks This Month"
          value={dashboard.toolbox_talks_this_month}
        />
        <KpiCard
          icon={Award}
          label="Expiring Certs"
          value={dashboard.expiring_certifications}
          accent={dashboard.expiring_certifications > 0}
        />
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--bg-elevated)' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
              style={{
                background: isActive ? 'var(--color-brand-card)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                border: isActive ? '1px solid var(--color-brand-border)' : '1px solid transparent',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'incidents' && <IncidentsTab incidents={incidents} />}
      {activeTab === 'toolbox_talks' && <ToolboxTalksTab talks={talks} />}
      {activeTab === 'certifications' && <CertificationsTab certs={certs} />}
    </div>
  );
}

/* ── Incidents Tab ──────────────────────────────────────────────────────── */

function IncidentsTab({ incidents }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = incidents.filter((inc) => {
    if (statusFilter && inc.status !== statusFilter) return false;
    if (typeFilter && inc.incident_type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs outline-none"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="corrective_action">Corrective Action</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs outline-none"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">All Types</option>
          <option value="near_miss">Near Miss</option>
          <option value="first_aid">First Aid</option>
          <option value="recordable">Recordable</option>
          <option value="lost_time">Lost Time</option>
          <option value="property_damage">Property Damage</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="mc-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Description</th>
              <th>Status</th>
              <th>OSHA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inc) => {
              const statusStyle = INCIDENT_STATUS_STYLES[inc.status] || INCIDENT_STATUS_STYLES.open;
              const sevStyle = SEVERITY_STYLES[inc.severity] || SEVERITY_STYLES.low;
              const TypeIcon = INCIDENT_TYPE_ICONS[inc.incident_type] || AlertTriangle;
              return (
                <tr key={inc.id}>
                  <td className="num">
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {shortDate(inc.incident_date)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <TypeIcon size={14} style={{ color: sevStyle.color, flexShrink: 0 }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                        {INCIDENT_TYPE_LABELS[inc.incident_type] || inc.incident_type}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                      style={{ background: sevStyle.bg, color: sevStyle.color }}
                    >
                      {inc.severity}
                    </span>
                  </td>
                  <td>
                    <div className="min-w-0 max-w-xs">
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {inc.description}
                      </p>
                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        Reported by {inc.reported_by}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded whitespace-nowrap"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                      {inc.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    {inc.osha_recordable ? (
                      <span
                        className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--status-loss-bg)', color: 'var(--status-loss)' }}
                      >
                        Yes
                      </span>
                    ) : (
                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        No
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-sm py-8" style={{ color: 'var(--text-tertiary)' }}>
                  No incidents match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Toolbox Talks Tab ──────────────────────────────────────────────────── */

function ToolboxTalksTab({ talks }) {
  return (
    <div className="space-y-4">
      <div className="panel-head">
        <h2 className="panel-title">Recent Toolbox Talks</h2>
        <p className="panel-sub">{talks.length} talk{talks.length !== 1 ? 's' : ''} conducted</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {talks.map((talk) => (
          <div
            key={talk.id}
            className="rounded-lg p-4"
            style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {talk.topic}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 mt-3">
              <div className="flex items-center gap-2 text-xs">
                <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{shortDate(talk.conducted_date)}</span>
                <span style={{ color: 'var(--text-tertiary)' }}>&middot;</span>
                <span className="num" style={{ color: 'var(--text-secondary)' }}>{talk.duration_minutes} min</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <HardHat size={12} style={{ color: 'var(--text-tertiary)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{talk.conducted_by}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Users size={12} style={{ color: 'var(--text-tertiary)' }} />
                <span className="num" style={{ color: 'var(--text-secondary)' }}>{talk.attendees} attendee{talk.attendees !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {talk.notes && (
              <p className="text-xs mt-3 line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>
                {talk.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {talks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No toolbox talks recorded yet</p>
        </div>
      )}
    </div>
  );
}

/* ── Certifications Tab ─────────────────────────────────────────────────── */

function CertificationsTab({ certs }) {
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = certs.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs outline-none"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="pending_renewal">Pending Renewal</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="mc-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Certification</th>
              <th>Cert #</th>
              <th>Issued</th>
              <th>Expiry</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cert) => {
              const statusStyle = CERT_STATUS_STYLES[cert.status] || CERT_STATUS_STYLES.active;
              const remaining = daysUntil(cert.expiry_date);
              const expiryWarning = remaining !== null && remaining <= 90 && cert.status !== 'expired';
              return (
                <tr key={cert.id}>
                  <td>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {cert.employee_name || `Employee #${cert.employee_id}`}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Award size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                        {cert.cert_type}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                      {cert.cert_number}
                    </span>
                  </td>
                  <td className="num">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {shortDate(cert.issued_date)}
                    </span>
                  </td>
                  <td className="num">
                    <div>
                      <span
                        className="text-xs"
                        style={{ color: cert.status === 'expired' ? 'var(--status-loss)' : expiryWarning ? 'var(--status-warning)' : 'var(--text-secondary)' }}
                      >
                        {shortDate(cert.expiry_date)}
                      </span>
                      {expiryWarning && remaining !== null && (
                        <div className="text-[10px]" style={{ color: 'var(--status-warning)' }}>
                          {remaining <= 0 ? 'Overdue' : `${remaining} days left`}
                        </div>
                      )}
                      {cert.status === 'expired' && (
                        <div className="text-[10px]" style={{ color: 'var(--status-loss)' }}>
                          Expired
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded whitespace-nowrap"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                      {CERT_STATUS_LABELS[cert.status] || cert.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-sm py-8" style={{ color: 'var(--text-tertiary)' }}>
                  No certifications match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
