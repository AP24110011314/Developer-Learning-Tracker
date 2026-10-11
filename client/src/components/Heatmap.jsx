// GitHub-style activity heatmap with 5-step color scale using CSS custom properties.
// Both light and dark mode colors are defined in index.css as --heatmap-0…4.
// Props: counts { "YYYY-MM-DD": n }, year (default = current year).
export default function Heatmap({ counts = {}, year }) {
  const y = year || new Date().getFullYear();
  const start = new Date(Date.UTC(y, 0, 1));
  const end   = new Date(Date.UTC(y + 1, 0, 1));

  // Pad first column so weeks start on Monday.
  const firstOffset = (start.getUTCDay() + 6) % 7;
  const days = [];
  for (let i = 0; i < firstOffset; i++) days.push(null);
  for (let d = new Date(start); d < end; d = new Date(d.getTime() + 86400000)) {
    days.push(d.toISOString().slice(0, 10));
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  // 5-step: 0, 1, 2, 3–4, 5+
  const colorClass = (n) => {
    if (!n || n === 0) return 'heatmap-0';
    if (n === 1)       return 'heatmap-1';
    if (n === 2)       return 'heatmap-2';
    if (n <= 4)        return 'heatmap-3';
    return 'heatmap-4';
  };

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-flex gap-0.5">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-[3px] mr-1">
          {DAYS.map((d, i) => (
            <div
              key={d}
              className="h-3 text-[9px] text-[var(--text-muted)] flex items-center"
              style={{ visibility: i % 2 === 0 ? 'visible' : 'hidden' }}
            >
              {d}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) =>
              day === null ? (
                <div key={di} className="w-3 h-3" />
              ) : (
                <div
                  key={day}
                  title={`${day}: ${counts[day] || 0} solved`}
                  className={`w-3 h-3 rounded-sm transition-opacity hover:opacity-75 cursor-default ${colorClass(counts[day] || 0)}`}
                  aria-label={`${day}: ${counts[day] || 0} problems solved`}
                />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
