const stats = [
  { value: "11+", label: "Profesionales" },
  { value: "7", label: "Estados de proyecto" },
  { value: "100%", label: "Confidencialidad" },
  { value: "NOA", label: "Cobertura regional" },
];

export function StatsSection() {
  return (
    <section className="border-y border-border/50 bg-surface/50 px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="mb-2 text-3xl font-bold text-primary md:text-4xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {stat.value}
              </div>
              <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
