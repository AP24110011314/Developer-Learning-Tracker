// GitHub-style activity heatmap (custom div grid — Recharts has no heatmap).
// Props: counts { "YYYY-MM-DD": n }, year (default = current year).
export default function Heatmap({ counts = {}, year }) {
  const y = year || new Date().getFullYear();
  const start = new Date(Date.UTC(y, 0, 1));
  const end = new Date(Date.UTC(y + 1, 0, 1));

  // Pad the first column so weeks start on Monday.
  // JS getUTCDay: 0=Sun..6=Sat -> Monday-first offset.
  const firstOffset = (start.getUTCDay() + 6) % 7;
  const days = [];
  for (let i = 0; i < firstOffset; i++) days.push(null);
  for (let d = new Date(start); d < end; d = new Date(d.getTime() + 86400000)) {
    days.push(d.toISOString().slice(0, 10));
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const color = (n) => {
    if (!n) return 'bg-gray-100';
    if (n === 1) return 'bg-green-200';
    if (n === 2) return 'bg-green-300';
    if (n <= 4) return 'bg-green-500';
    return 'bg-green-700';
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) =>
              day === null ? (
                <div key={di} className="w-3 h-3" />
              ) : (
                <div
                  key={day}
                  title={`${day}: ${counts[day] || 0} solved`}
                  className={`w-3 h-3 rounded-sm ${color(counts[day] || 0)}`}
                />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
