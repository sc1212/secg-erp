import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { money } from '../lib/format';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import DemoBanner from '../components/DemoBanner';
import { AlertTriangle, Clock, Filter, MapPin, Package, Plus, Search, Table, Warehouse } from 'lucide-react';

/* ── Demo Data ─────────────────────────────────────────────────────────── */

const demoMaterials = [
  {
    id: 1, name: '2x4x8 SPF Stud', sku: 'LBR-2408', category: 'Lumber',
    unit: 'each', default_unit_cost: 3.89, min_stock_alert: 200,
    total_qty: 847, locations: 3, value: 3294.83,
    location_details: [
      { location_name: 'Riverside — Jobsite', quantity: 420 },
      { location_name: 'Maple Ridge — Jobsite', quantity: 312 },
      { location_name: 'Main Warehouse', quantity: 115 },
    ],
    last_txn_days: 2, status: 'OK',
  },
  {
    id: 2, name: '1/2" Drywall 4x8', sku: 'DRY-1248', category: 'Hardware',
    unit: 'each', default_unit_cost: 12.48, min_stock_alert: 100,
    total_qty: 42, locations: 1, value: 524.16,
    location_details: [
      { location_name: 'Main Warehouse', quantity: 42 },
    ],
    last_txn_days: 8, status: 'LOW',
  },
  {
    id: 3, name: 'Romex 12/2 250ft', sku: 'ELC-1225', category: 'Electrical',
    unit: 'each', default_unit_cost: 89.99, min_stock_alert: 15,
    total_qty: 8, locations: 2, value: 719.92,
    location_details: [
      { location_name: 'Main Warehouse', quantity: 5 },
      { location_name: 'Van #3 — Vehicle', quantity: 3 },
    ],
    last_txn_days: 14, status: 'LOW',
  },
  {
    id: 4, name: 'PEX 3/4" 100ft', sku: 'PLB-0734', category: 'Plumbing',
    unit: 'each', default_unit_cost: 54.50, min_stock_alert: 10,
    total_qty: 2, locations: 1, value: 109.00,
    location_details: [
      { location_name: 'Van #1 — Vehicle', quantity: 2 },
    ],
    last_txn_days: 5, status: 'CRITICAL',
  },
  {
    id: 5, name: '3" PVC DWV 10ft', sku: 'PLB-0310', category: 'Plumbing',
    unit: 'each', default_unit_cost: 8.75, min_stock_alert: 20,
    total_qty: 48, locations: 1, value: 420.00,
    location_details: [
      { location_name: 'Main Warehouse', quantity: 48 },
    ],
    last_txn_days: 94, status: 'IDLE',
  },
];

const demoAlerts = {
  low_stock: [
    { material_id: 2, name: '1/2" Drywall 4x8', sku: 'DRY-1248', category: 'Hardware', total_quantity: 42, min_stock_alert: 100, deficit: 58, alert_type: 'low' },
    { material_id: 3, name: 'Romex 12/2 250ft', sku: 'ELC-1225', category: 'Electrical', total_quantity: 8, min_stock_alert: 15, deficit: 7, alert_type: 'low' },
    { material_id: 4, name: 'PEX 3/4" 100ft', sku: 'PLB-0734', category: 'Plumbing', total_quantity: 2, min_stock_alert: 10, deficit: 8, alert_type: 'critical' },
  ],
  idle_materials: [
    { material_id: 5, name: '3" PVC DWV 10ft', sku: 'PLB-0310', category: 'Plumbing', last_transaction_date: '2025-11-20', days_idle: 94, alert_type: 'idle' },
  ],
  total_alerts: 4,
};

const demoLocations = [
  { name: 'Main Warehouse', type: 'warehouse', materials_count: 4, total_value: 2178.08 },
  { name: 'Riverside — Jobsite', type: 'jobsite', materials_count: 1, total_value: 1633.80 },
  { name: 'Maple Ridge — Jobsite', type: 'jobsite', materials_count: 1, total_value: 1213.68 },
  { name: 'Van #1 — Vehicle', type: 'vehicle', materials_count: 1, total_value: 109.00 },
  { name: 'Van #3 — Vehicle', type: 'vehicle', materials_count: 1, total_value: 269.97 },
];

const CATEGORIES = ['Lumber', 'Plumbing', 'Electrical', 'Hardware', 'Concrete'];

/* ── Status Badge ──────────────────────────────────────────────────────── */

function StatusBadge({ status }) {
  const config = {
    OK:       { bg: 'var(--status-profit-bg)', color: 'var(--status-profit)', label: 'OK' },
    LOW:      { bg: 'var(--status-warning-bg)', color: 'var(--status-warning)', label: 'LOW' },
    CRITICAL: { bg: 'color-mix(in srgb, var(--status-loss) 15%, transparent)', color: 'var(--status-loss)', label: 'CRITICAL' },
    IDLE:     { bg: 'var(--bg-elevated)', color: 'var(--text-tertiary)', label: 'IDLE 90+ DAYS' },
  };
  const c = config[status] || config.OK;
  return (
    <span
      className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

/* ── Tabs ───────────────────────────────────────────────────────────────── */

const TABS = [
  { key: 'materials', label: 'All Materials', icon: Package },
  { key: 'locations', label: 'By Location', icon: Warehouse },
  { key: 'alerts',    label: 'Alerts',       icon: AlertTriangle },
];

/* ── Main Component ─────────────────────────────────────────────────────── */

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('materials');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // API calls
  const { data: materialsData, loading, error, isDemo } = useApi(
    () => api.inventoryMaterials({ ...(search && { search }), ...(categoryFilter && { category: categoryFilter }) }),
    [search, categoryFilter]
  );
  const { data: alertsData } = useApi(() => api.inventoryAlerts(), []);

  const materials = materialsData || (loading ? [] : demoMaterials);
  const alerts = alertsData || demoAlerts;

  if (loading) return <PageLoading />;
  if (error && !materials.length) return <ErrorState message={error} />;

  // Compute summaries from demo data
  const totalItems = materials.length;
  const totalOnHand = materials.reduce((s, m) => s + (m.total_qty || 0), 0);
  const totalValue = materials.reduce((s, m) => s + (m.value || 0), 0);
  const alertCount = (alerts.low_stock?.length || 0) + (alerts.idle_materials?.length || 0);

  // Filter materials for display
  const filtered = materials.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !(m.sku || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && m.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Materials & Inventory
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {totalItems} materials tracked across {demoLocations.length} locations
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Plus size={14} /> Add Material
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Package} label="Catalog Items" value={totalItems} />
        <KpiCard icon={Warehouse} label="Total On Hand" value={totalOnHand.toLocaleString()} />
        <KpiCard icon={Package} label="Inventory Value" value={money(totalValue)} />
        <KpiCard
          icon={AlertTriangle}
          label="Active Alerts"
          value={alertCount}
          accent={alertCount > 0}
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
              {tab.key === 'alerts' && alertCount > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--status-loss)', color: '#fff', lineHeight: 1 }}
                >
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'materials' && (
        <MaterialsTab
          materials={filtered}
          search={search}
          setSearch={setSearch}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />
      )}
      {activeTab === 'locations' && <LocationsTab locations={demoLocations} materials={materials} />}
      {activeTab === 'alerts' && <AlertsTab alerts={alerts} />}
    </div>
  );
}

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
      <div className="text-xl font-bold" style={{ color: accent ? 'var(--status-loss)' : 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

/* ── Materials Tab ──────────────────────────────────────────────────────── */

function MaterialsTab({ materials, search, setSearch, categoryFilter, setCategoryFilter }) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded text-sm"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)' }}
        >
          <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search materials..."
            className="bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)', width: 200 }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 rounded text-xs"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {materials.length === 0 ? (
        <EmptyState title="No materials found" message="Adjust your search or add a new material" />
      ) : (
        <div className="overflow-x-auto">
          <table className="mc-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Category</th>
                <th>On Hand</th>
                <th>Locations</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Package size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {m.name}
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                          {m.sku} &middot; {m.unit}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {m.category}
                    </span>
                  </td>
                  <td className="num">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {(m.total_qty || 0).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} style={{ color: 'var(--text-tertiary)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {m.locations}
                      </span>
                    </div>
                  </td>
                  <td className="num">
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {money(m.value)}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={m.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Locations Tab ──────────────────────────────────────────────────────── */

function LocationsTab({ locations, materials }) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const locationTypeIcon = (type) => {
    if (type === 'warehouse') return Warehouse;
    if (type === 'vehicle') return Package;
    return MapPin;
  };

  const materialsAtLocation = selectedLocation
    ? materials.filter((m) =>
        (m.location_details || []).some((ld) => ld.location_name === selectedLocation)
      ).map((m) => {
        const ld = (m.location_details || []).find((l) => l.location_name === selectedLocation);
        return { ...m, location_qty: ld ? ld.quantity : 0 };
      })
    : [];

  return (
    <div className="space-y-4">
      {!selectedLocation ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {locations.map((loc) => {
            const Icon = locationTypeIcon(loc.type);
            return (
              <div
                key={loc.name}
                className="rounded-lg p-4 cursor-pointer transition-colors"
                style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
                onClick={() => setSelectedLocation(loc.name)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: 'var(--accent)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {loc.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    {loc.type}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {loc.materials_count} item{loc.materials_count !== 1 ? 's' : ''} &middot; {money(loc.total_value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedLocation(null)}
            className="flex items-center gap-1 text-sm"
            style={{ color: 'var(--accent)' }}
          >
            &larr; Back to locations
          </button>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {selectedLocation}
          </h2>
          {materialsAtLocation.length === 0 ? (
            <EmptyState title="No materials" message="No materials at this location" />
          ) : (
            <div className="overflow-x-auto">
              <table className="mc-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>SKU</th>
                    <th>Qty at Location</th>
                    <th>Unit Cost</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {materialsAtLocation.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {m.name}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {m.sku}
                        </span>
                      </td>
                      <td className="num">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {(m.location_qty || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="num">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {money(m.default_unit_cost)}
                        </span>
                      </td>
                      <td className="num">
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {money((m.location_qty || 0) * (m.default_unit_cost || 0))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Alerts Tab ─────────────────────────────────────────────────────────── */

function AlertsTab({ alerts }) {
  const lowStock = alerts.low_stock || [];
  const idle = alerts.idle_materials || [];

  return (
    <div className="space-y-6">
      {/* Low Stock Alerts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} style={{ color: 'var(--status-loss)' }} />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Low Stock ({lowStock.length})
          </h3>
        </div>
        {lowStock.length === 0 ? (
          <EmptyState title="All stocked" message="No materials below minimum stock levels" />
        ) : (
          <div className="space-y-2">
            {lowStock.map((item) => (
              <div
                key={item.material_id}
                className="rounded-lg p-3 flex items-center justify-between gap-4"
                style={{
                  background: item.alert_type === 'critical'
                    ? 'color-mix(in srgb, var(--status-loss) 10%, transparent)'
                    : 'var(--status-warning-bg)',
                  border: `1px solid color-mix(in srgb, ${item.alert_type === 'critical' ? 'var(--status-loss)' : 'var(--status-warning)'} 30%, transparent)`,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <AlertTriangle
                    size={16}
                    style={{ color: item.alert_type === 'critical' ? 'var(--status-loss)' : 'var(--status-warning)', flexShrink: 0 }}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.name}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      {item.sku} &middot; {item.category}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold" style={{ color: item.alert_type === 'critical' ? 'var(--status-loss)' : 'var(--status-warning)' }}>
                    {item.total_quantity} on hand
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    min: {item.min_stock_alert} &middot; need {item.deficit} more
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Idle Materials */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} style={{ color: 'var(--text-tertiary)' }} />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Idle Materials ({idle.length})
          </h3>
        </div>
        {idle.length === 0 ? (
          <EmptyState title="No idle materials" message="All materials have recent activity" />
        ) : (
          <div className="space-y-2">
            {idle.map((item) => (
              <div
                key={item.material_id}
                className="rounded-lg p-3 flex items-center justify-between gap-4"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Clock
                    size={16}
                    style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.name}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      {item.sku} &middot; {item.category}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    {item.days_idle ? `${item.days_idle} days idle` : 'No transactions'}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    {item.last_transaction_date ? `Last: ${item.last_transaction_date}` : 'Never used'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
