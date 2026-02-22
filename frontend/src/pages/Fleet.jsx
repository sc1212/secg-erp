export default function Fleet() {
  const vehicles = [
    { name: '2021 Ford F-250 Super Duty', mileage: '142,308', due: 'Oil change due in 800 mi', assignee: 'Jake R.', project: 'PRJ-042' },
    { name: '2019 F-150 XLT', mileage: '98,421', due: 'All maintenance current', assignee: 'Chris T.', project: 'PRJ-038' },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Fleet & Equipment</h1>
      <div className="bg-brand-card border border-brand-border rounded-lg p-4 space-y-2">
        {vehicles.map((v) => (
          <div key={v.name} className="bg-brand-surface border border-brand-border rounded-lg p-3 text-sm">
            <div className="font-semibold">{v.name}</div>
            <div className="text-brand-muted">{v.mileage} mi · {v.assignee} · {v.project}</div>
            <div className="mt-1">{v.due}</div>
          </div>
        ))}
import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { shortDate, money } from '../lib/format';
import { PageLoading, ErrorState } from '../components/LoadingState';
import KPICard from '../components/KPICard';
import DemoBanner from '../components/DemoBanner';
import { Truck, Wrench, Fuel, AlertTriangle } from 'lucide-react';

/* ── Demo data ────────────────────────────────────────────────────────── */

const demoVehicles = [
  {
    id: 1,
    name: '2022 Ford F-250 (Unit 01)',
    vin: '1FT7W2BT4NED00001',
    license_plate: 'TN-4821',
    vehicle_type: 'truck',
    year: 2022,
    make: 'Ford',
    model: 'F-250',
    color: 'White',
    current_mileage: 142350,
    fuel_type: 'diesel',
    assigned_to: 1,
    assigned_project: 1,
    status: 'active',
    purchase_date: '2022-03-15',
    purchase_price: 62500,
    insurance_expiry: '2026-08-01',
    registration_expiry: '2026-06-15',
    assigned_employee_name: 'Mike Sullivan',
    assigned_project_name: 'PRJ-042 Riverside Custom',
    next_maintenance: 'Oil Change in 800 mi',
    next_maintenance_urgency: 'due_soon',
    avg_mpg: 14.2,
  },
  {
    id: 2,
    name: '2023 Ford F-150 (Unit 02)',
    vin: '1FTEW1EP5NFA00002',
    license_plate: 'TN-5937',
    vehicle_type: 'truck',
    year: 2023,
    make: 'Ford',
    model: 'F-150',
    color: 'Blue',
    current_mileage: 98420,
    fuel_type: 'gasoline',
    assigned_to: 2,
    assigned_project: 2,
    status: 'active',
    purchase_date: '2023-01-10',
    purchase_price: 55800,
    insurance_expiry: '2026-09-15',
    registration_expiry: '2026-07-20',
    assigned_employee_name: 'Jake Torres',
    assigned_project_name: 'PRJ-038 Mountain View',
    next_maintenance: 'All current',
    next_maintenance_urgency: 'ok',
    avg_mpg: 18.6,
  },
  {
    id: 3,
    name: '2021 Ford Transit Van (Unit 03)',
    vin: '1FTBW2CM1MKA00003',
    license_plate: 'TN-3104',
    vehicle_type: 'van',
    year: 2021,
    make: 'Ford',
    model: 'Transit 250',
    color: 'White',
    current_mileage: 31200,
    fuel_type: 'gasoline',
    assigned_to: 3,
    assigned_project: null,
    status: 'active',
    purchase_date: '2021-06-22',
    purchase_price: 42000,
    insurance_expiry: '2026-06-22',
    registration_expiry: '2026-05-01',
    assigned_employee_name: 'Derek Hall',
    assigned_project_name: null,
    next_maintenance: 'Brake Inspection due',
    next_maintenance_urgency: 'overdue',
    avg_mpg: 16.1,
  },
  {
    id: 4,
    name: 'Kubota SVL75-2 Skid Steer',
    vin: null,
    license_plate: null,
    vehicle_type: 'skid_steer',
    year: 2020,
    make: 'Kubota',
    model: 'SVL75-2',
    color: 'Orange',
    current_mileage: 312,
    fuel_type: 'diesel',
    assigned_to: null,
    assigned_project: 1,
    status: 'active',
    purchase_date: '2020-09-05',
    purchase_price: 68000,
    insurance_expiry: '2026-09-05',
    registration_expiry: null,
    assigned_employee_name: null,
    assigned_project_name: 'PRJ-042 Riverside Custom',
    next_maintenance: 'Service at 350 hrs',
    next_maintenance_urgency: 'due_soon',
    avg_mpg: null,
  },
];

const demoAlerts = [
  {
    vehicle_id: 3,
    vehicle_name: '2021 Ford Transit Van (Unit 03)',
    service_type: 'Brake Inspection',
    next_due_date: '2026-02-15',
    next_due_mileage: 30000,
    current_mileage: 31200,
    miles_until_due: -1200,
    days_until_due: -7,
    urgency: 'overdue',
  },
  {
    vehicle_id: 1,
    vehicle_name: '2022 Ford F-250 (Unit 01)',
    service_type: 'Oil Change',
    next_due_date: '2026-03-20',
    next_due_mileage: 143150,
    current_mileage: 142350,
    miles_until_due: 800,
    days_until_due: 26,
    urgency: 'due_soon',
  },
  {
    vehicle_id: 4,
    vehicle_name: 'Kubota SVL75-2 Skid Steer',
    service_type: '350-Hour Service',
    next_due_date: null,
    next_due_mileage: 350,
    current_mileage: 312,
    miles_until_due: 38,
    days_until_due: null,
    urgency: 'due_soon',
  },
];

/* ── Helpers ──────────────────────────────────────────────────────────── */

const STATUS_STYLES = {
  active: { bg: 'var(--status-profit-bg)', color: 'var(--status-profit)' },
  in_shop: { bg: 'var(--status-warning-bg)', color: 'var(--status-warning)' },
  out_of_service: { bg: 'var(--status-loss-bg)', color: 'var(--status-loss)' },
  sold: { bg: 'var(--bg-elevated)', color: 'var(--text-tertiary)' },
};

const URGENCY_STYLES = {
  overdue: { bg: 'var(--status-loss-bg)', color: 'var(--status-loss)' },
  due_soon: { bg: 'var(--status-warning-bg)', color: 'var(--status-warning)' },
  upcoming: { bg: 'var(--status-profit-bg)', color: 'var(--status-profit)' },
  ok: { bg: 'var(--status-profit-bg)', color: 'var(--status-profit)' },
};

const VEHICLE_TYPE_LABELS = {
  truck: 'Truck',
  trailer: 'Trailer',
  excavator: 'Excavator',
  skid_steer: 'Skid Steer',
  van: 'Van',
  car: 'Car',
};

function formatMileage(val, type) {
  if (val == null) return '--';
  if (type === 'skid_steer' || type === 'excavator') {
    return `${Number(val).toLocaleString()} hrs`;
  }
  return `${Number(val).toLocaleString()} mi`;
}

/* ── Component ────────────────────────────────────────────────────────── */

export default function Fleet() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data: vehiclesData, loading, error, isDemo } = useApi(
    () => api.fleetVehicles({ ...(statusFilter && { status: statusFilter }), ...(search && { search }) }),
    [statusFilter, search]
  );

  const { data: alertsData } = useApi(() => api.fleetAlerts(), []);

  const vehicles = vehiclesData || (loading ? [] : demoVehicles);
  const alerts = alertsData || demoAlerts;

  if (loading) return <PageLoading />;
  if (error && !vehicles.length) return <ErrorState message={error} />;

  // Filter demo data client-side when backend unavailable
  const filtered = isDemo
    ? vehicles.filter((v) => {
        if (statusFilter && v.status !== statusFilter) return false;
        if (search) {
          const s = search.toLowerCase();
          return (
            v.name.toLowerCase().includes(s) ||
            (v.vin && v.vin.toLowerCase().includes(s)) ||
            (v.license_plate && v.license_plate.toLowerCase().includes(s))
          );
        }
        return true;
      })
    : vehicles;

  const activeCount = (isDemo ? demoVehicles : vehicles).filter((v) => v.status === 'active').length;
  const maintenanceDue = alerts.filter((a) => a.urgency === 'overdue' || a.urgency === 'due_soon').length;

  // Average MPG from demo data
  const mpgVehicles = (isDemo ? demoVehicles : vehicles).filter((v) => v.avg_mpg != null);
  const avgMpg = mpgVehicles.length > 0
    ? (mpgVehicles.reduce((sum, v) => sum + v.avg_mpg, 0) / mpgVehicles.length).toFixed(1)
    : '--';

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Fleet & Equipment</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} in fleet
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Truck size={14} /> Add Vehicle
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard label="Active Vehicles" value={activeCount} sub={`${(isDemo ? demoVehicles : vehicles).length} total`} icon={Truck} />
        <KPICard
          label="Maintenance Due"
          value={maintenanceDue}
          sub={maintenanceDue > 0 ? 'needs attention' : 'all current'}
          icon={Wrench}
        />
        <KPICard label="Avg MPG" value={avgMpg} sub="fleet average" icon={Fuel} />
      </div>

      {/* Maintenance Alerts */}
      {alerts.length > 0 && (
        <div
          className="rounded-lg p-4"
          style={{
            background: 'var(--status-warning-bg)',
            border: '1px solid color-mix(in srgb, var(--status-warning) 30%, transparent)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} style={{ color: 'var(--status-warning)' }} />
            <span className="text-xs font-bold uppercase" style={{ color: 'var(--status-warning)' }}>
              Maintenance Alerts
            </span>
          </div>
          <div className="space-y-1.5">
            {alerts.map((a, i) => {
              const style = URGENCY_STYLES[a.urgency] || URGENCY_STYLES.upcoming;
              return (
                <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                  <span
                    className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {a.urgency === 'overdue' ? 'Overdue' : a.urgency === 'due_soon' ? 'Due Soon' : 'Upcoming'}
                  </span>
                  <span className="font-medium">{a.vehicle_name}</span>
                  <span style={{ color: 'var(--text-tertiary)' }}>&mdash;</span>
                  <span>{a.service_type}</span>
                  {a.miles_until_due != null && (
                    <span style={{ color: style.color }}>
                      {a.miles_until_due <= 0
                        ? `${Math.abs(a.miles_until_due).toLocaleString()} mi overdue`
                        : `${a.miles_until_due.toLocaleString()} mi remaining`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)' }}
        >
          <Truck size={14} style={{ color: 'var(--text-tertiary)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicles..."
            className="bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)', width: 180 }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="in_shop">In Shop</option>
          <option value="out_of_service">Out of Service</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {/* Vehicle Table */}
      <div className="overflow-x-auto">
        <table className="mc-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Project</th>
              <th>Mileage / Hours</th>
              <th>Next Maintenance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const sts = STATUS_STYLES[v.status] || STATUS_STYLES.active;
              const urgencyKey = v.next_maintenance_urgency || 'ok';
              const urgStyle = URGENCY_STYLES[urgencyKey] || URGENCY_STYLES.ok;
              return (
                <tr key={v.id}>
                  <td>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {v.name}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        {v.license_plate || v.vin || '--'}
                      </div>
                    </div>
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {VEHICLE_TYPE_LABELS[v.vehicle_type] || v.vehicle_type || '--'}
                  </td>
                  <td>
                    <span
                      className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                      style={{ background: sts.bg, color: sts.color }}
                    >
                      {v.status ? v.status.replace(/_/g, ' ') : '--'}
                    </span>
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {v.assigned_employee_name || '--'}
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {v.assigned_project_name || '--'}
                  </td>
                  <td className="text-xs num" style={{ color: 'var(--text-primary)' }}>
                    {formatMileage(v.current_mileage, v.vehicle_type)}
                  </td>
                  <td>
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ background: urgStyle.bg, color: urgStyle.color }}
                    >
                      {v.next_maintenance || 'All current'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-sm py-8" style={{ color: 'var(--text-tertiary)' }}>
                  No vehicles match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
