export default function Inventory() {
  const items = [
    ['2x4x8 SPF Stud', 'Lumber', '847', '$4,235', 'OK'],
    ['1/2" Type X Drywall', 'Drywall', '42', '$546', 'LOW'],
    ['PEX 3/4 x 100ft', 'Plumbing', '2', '$140', 'CRITICAL'],
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Inventory</h1>
      <div className="bg-brand-card border border-brand-border rounded-lg p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase text-brand-muted border-b border-brand-border"><th className="pb-2">Material</th><th className="pb-2">Category</th><th className="pb-2 num">On Hand</th><th className="pb-2 num">Value</th><th className="pb-2">Status</th></tr></thead>
          <tbody>{items.map((r) => <tr key={r[0]} className="border-b border-brand-border/50"><td className="py-2">{r[0]}</td><td className="py-2">{r[1]}</td><td className="py-2 num">{r[2]}</td><td className="py-2 num">{r[3]}</td><td className="py-2">{r[4]}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
