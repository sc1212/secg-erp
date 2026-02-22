import { AlertTriangle, CalendarClock, CloudRain, DollarSign, Truck } from 'lucide-react';

export default function MorningBriefing() {
  const actions = [
    'Approve CO #7 for PRJ-042 ($12,400)',
    'ABC Plumbing COI expires in 12 days',
    'Payroll runs Friday — review submitted hours',
  ];

  return (
    <div className="space-y-4">
      <div className="bg-brand-card border border-brand-border rounded-lg p-5">
        <p className="text-xs uppercase tracking-wide text-brand-muted">Morning Briefing</p>
        <h1 className="text-2xl font-bold mt-1">Good morning, Matt — Friday</h1>
        <p className="text-sm text-brand-muted mt-1">Personalized snapshot assembled from cash, weather, logs, fleet, and queue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <BriefCard icon={DollarSign} label="Cash Position" value="$277,912" sub="+$45,000 yesterday" />
        <BriefCard icon={CloudRain} label="Weather Watch" value="2 jobs affected" sub="Rain Wed 85%" />
        <BriefCard icon={CalendarClock} label="Inspections" value="3 today" sub="First at 9:00 AM" />
        <BriefCard icon={Truck} label="Fleet" value="1 due" sub="F-250 oil change" />
        <BriefCard icon={AlertTriangle} label="Attention Items" value="3" sub="Action required" />
      </div>

      <div className="bg-brand-card border border-brand-border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Needs your attention</h3>
        <div className="space-y-2">
          {actions.map((item) => (
            <div key={item} className="flex items-center justify-between bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm">
              <span>{item}</span>
              <button className="text-brand-gold lg:hover:text-brand-gold-light">Open</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BriefCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-lg p-3">
      <div className="text-xs text-brand-muted flex items-center gap-1"><Icon size={13} /> {label}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
      <div className="text-xs text-brand-muted">{sub}</div>
    </div>
  );
}
