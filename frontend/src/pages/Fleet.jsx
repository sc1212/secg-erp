import { useState } from 'react';
import { AlertTriangle, ChevronRight, X } from 'lucide-react';
import { money } from '../lib/format';

const VEHICLES = [
  { id: 1, unit: '01', year: 2022, make: 'Ford',   model: 'F-250 Super Duty', type: 'Truck',       plate: 'TN-4821', color: 'White',  mileage: 42350,  driver: 'Connor Webb',   project: 'Riverside Custom Home',      status: 'active',     service: 'Oil change due — 43,000 mi', serviceStatus: 'warning',  fuel: 'Diesel',   purchase: 62500, insExp: '2026-08-01', regExp: '2026-06-15' },
  { id: 2, unit: '02', year: 2023, make: 'Ford',   model: 'F-150',            type: 'Truck',       plate: 'TN-5937', color: 'Blue',   mileage: 28420,  driver: 'Joseph Hall',   project: 'Magnolia Spec Home',         status: 'active',     service: 'All current',                serviceStatus: 'ok',       fuel: 'Gas',      purchase: 55800, insExp: '2026-09-15', regExp: '2026-07-20' },
  { id: 3, unit: '03', year: 2021, make: 'Ford',   model: 'Transit 250 Van',  type: 'Van',         plate: 'TN-3104', color: 'White',  mileage: 31200,  driver: 'Zach Monroe',   project: 'Johnson Office TI',          status: 'in_service', service: 'Brake inspection — OVERDUE', serviceStatus: 'critical', fuel: 'Gas',      purchase: 42000, insExp: '2026-06-22', regExp: '2026-05-01' },
  { id: 4, unit: '04', year: 2023, make: 'Ram',    model: '3500 Dually',      type: 'Truck',       plate: 'TN-7261', color: 'Black',  mileage: 19840,  driver: 'Abi Darnell',   project: 'Elm St Multifamily',         status: 'active',     service: 'All current',                serviceStatus: 'ok',       fuel: 'Diesel',   purchase: 67400, insExp: '2026-10-01', regExp: '2026-08-30' },
  { id: 5, unit: '05', year: 2020, make: 'Kubota', model: 'SVL75-2 Skid Steer',type: 'Equipment',  plate: null,      color: 'Orange', mileage: 312,    driver: null,            project: 'Riverside Custom Home',      status: 'active',     service: 'Service at 350 hrs',         serviceStatus: 'warning',  fuel: 'Diesel',   purchase: 68000, insExp: '2026-09-05', regExp: null },
  { id: 6, unit: '06', year: 2019, make: 'Ford',   model: 'F-350 Dump Truck', type: 'Dump Truck',  plate: 'TN-2093', color: 'White',  mileage: 87650,  driver: 'Alex Torres',   project: null,                         status: 'active',     service: 'Tire rotation due',          serviceStatus: 'warning',  fuel: 'Diesel',   purchase: 58000, insExp: '2026-07-12', regExp: '2026-06-01' },
  { id: 7, unit: '07', year: 2018, make: 'Ford',   model: 'F-250',            type: 'Truck',       plate: 'TN-1147', color: 'Red',    mileage: 121400, driver: null,            project: null,                         status: 'out_of_service', service: 'Engine repair — in shop',  serviceStatus: 'critical', fuel: 'Gas',      purchase: 38000, insExp: '2026-04-20', regExp: '2026-03-15' },
  { id: 8, unit: 'TR1', year: 2020, make: 'PJ',   model: '20-ft Flatbed Trailer', type: 'Trailer', plate: 'TN-T88',  color: 'Black',  mileage: null,   driver: null,            project: 'Riverside Custom Home',      status: 'active',     service: 'Annual safety check due',   serviceStatus: 'warning',  fuel: null,       purchase: 14500, insExp: '2026-08-01', regExp: '2026-06-15' },
];

const STATUS_COLOR = {
  active:         { color: 'var(--status-profit)',  bg: 'rgba(34,197,94,0.12)',   label: 'Active' },
  in_service:     { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'In Service' },
  out_of_service: { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'Out of Service' },
};

const SERVICE_COLOR = {
  ok:       { color: 'var(--status-profit)',  bg: 'rgba(34,197,94,0.10)' },
  warning:  { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.10)' },
  critical: { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.10)' },
};

function VehicleDetail({ v, onClose }) {
  const sc = STATUS_COLOR[v.status] || STATUS_COLOR.active;
  const svc = SERVICE_COLOR[v.serviceStatus] || SERVICE_COLOR.ok;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 12, width: '100%', maxWidth: 580, maxHeight: '85vh', overflow: 'auto' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{v.year} {v.make} {v.model}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Unit {v.unit}{v.plate ? ` \u00B7 ${v.plate}` : ''}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            ['Type', v.type],
            ['Color', v.color],
            ['Plate', v.plate || 'N/A (equipment)'],
            ['Mileage / Hours', v.mileage != null ? (v.type === 'Equipment' ? `${v.mileage} hrs` : `${v.mileage.toLocaleString()} mi`) : 'N/A'],
            ['Assigned Driver', v.driver || 'Unassigned'],
            ['Current Project', v.project || 'Not assigned'],
            ['Fuel Type', v.fuel || 'N/A'],
            ['Purchase Price', money(v.purchase)],
            ['Insurance Exp', v.insExp || 'N/A'],
            ['Registration Exp', v.regExp || 'N/A'],
          ].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{val}</div>
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1', padding: '10px 14px', borderRadius: 8, background: svc.bg, border: `1px solid ${svc.color}22` }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 4 }}>Maintenance</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: svc.color }}>{v.service}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 4 }}>Status</div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5, background: sc.bg, color: sc.color }}>{sc.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Fleet() {
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const statuses = ['All', 'Active', 'In Service', 'Out of Service'];
  const statusMap = { All: null, Active: 'active', 'In Service': 'in_service', 'Out of Service': 'out_of_service' };
  const filtered = statusFilter === 'All' ? VEHICLES : VEHICLES.filter(v => v.status === statusMap[statusFilter]);

  const criticals = VEHICLES.filter(v => v.serviceStatus === 'critical');
  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  return (
    <div className="space-y-5">
      {selected && <VehicleDetail v={selected} onClose={() => setSelected(null)} />}

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Fleet &amp; Equipment</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{VEHICLES.length} units tracked &middot; {VEHICLES.filter(v => v.status === 'active').length} active</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Total Units', VEHICLES.length, '#3b82f6'],
          ['Active', VEHICLES.filter(v => v.status === 'active').length, 'var(--status-profit)'],
          ['In Service / Down', VEHICLES.filter(v => v.status !== 'active').length, 'var(--status-warning)'],
          ['Maintenance Alerts', VEHICLES.filter(v => v.serviceStatus !== 'ok').length, 'var(--status-loss)'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color }}>{val}</div>
          </div>
        ))}
      </div>

      {criticals.length > 0 && (
        <div style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <AlertTriangle size={15} style={{ color: 'var(--status-loss)', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-loss)', marginBottom: 4 }}>Immediate Attention Required</div>
            {criticals.map(v => (
              <div key={v.id} style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Unit {v.unit} ({v.year} {v.make} {v.model}) &mdash; {v.service}</div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            border: `1px solid ${statusFilter === s ? '#3b82f6' : 'var(--color-brand-border)'}`,
            background: statusFilter === s ? 'rgba(59,130,246,0.14)' : 'transparent',
            color: statusFilter === s ? '#3b82f6' : 'var(--text-secondary)',
          }}>{s}</button>
        ))}
      </div>

      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {[['Unit','left'],['Vehicle','left'],['Type','left'],['Driver','left'],['Project','left'],['Mileage','right'],['Maintenance','left'],['Status','left'],['','left']].map(([h, align]) => (
              <th key={h} style={{ ...thBase, textAlign: align }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(v => {
              const sc = STATUS_COLOR[v.status] || STATUS_COLOR.active;
              const svc = SERVICE_COLOR[v.serviceStatus] || SERVICE_COLOR.ok;
              return (
                <tr key={v.id} onClick={() => setSelected(v)}
                  style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-tertiary)' }}>{v.unit}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{v.year} {v.make} {v.model}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>{v.plate || 'Equipment'}</div>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{v.type}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{v.driver || <span style={{ color: 'var(--text-tertiary)' }}>Unassigned</span>}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{v.project || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>
                    {v.mileage != null ? (v.type === 'Equipment' ? `${v.mileage} hrs` : `${v.mileage.toLocaleString()} mi`) : '—'}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: svc.bg, color: svc.color }}>{v.service}</span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </td>
                  <td style={{ padding: '11px 14px' }}><ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
