export default function StatCard({ label, value, tone = 'primary' }) {
  const tones = {
    primary: 'border-primary/20 bg-primary/5',
    violet: 'border-violet/20 bg-violet/5',
    teal: 'border-teal/20 bg-teal/5',
  };

  return (
    <div className={`rounded-lg border p-5 ${tones[tone]}`}>
      <div className="text-sm font-medium text-muted">{label}</div>
      <div className="mt-2 text-3xl font-bold text-ink">{value}</div>
    </div>
  );
}
