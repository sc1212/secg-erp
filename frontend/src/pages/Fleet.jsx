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
      </div>
    </div>
  );
}
