export default function Safety() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Safety</h1>
      <div className="bg-brand-card border border-brand-border rounded-lg p-4">
        <div className="text-sm">Days since last incident: <span className="font-semibold text-ok">47</span></div>
        <div className="text-xs text-brand-muted mt-1">Certification expiry and toolbox talks feed this center.</div>
      </div>
    </div>
  );
}
