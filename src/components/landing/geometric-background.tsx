export function GeometricBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-40 -right-40 h-[500px] w-[500px] rotate-45 opacity-[0.03]"
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 50%, transparent 100%)",
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        }}
      />
      <div
        className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rotate-12 opacity-[0.02]"
        style={{
          background:
            "linear-gradient(45deg, var(--accent) 0%, var(--accent-dark) 50%, transparent 100%)",
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 opacity-[0.015]"
        style={{
          background:
            "radial-gradient(circle at center, var(--primary) 0%, transparent 70%)",
        }}
      />
      <div className="absolute top-1/4 right-1/4 h-px w-64 rotate-[30deg] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-1/3 left-1/3 h-px w-48 -rotate-[25deg] bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
      <div
        className="absolute top-2/3 right-1/6 h-[300px] w-[300px] opacity-[0.02]"
        style={{
          background:
            "linear-gradient(180deg, var(--primary) 0%, transparent 100%)",
          clipPath: "polygon(50% 0%, 100% 75%, 50% 100%, 0% 75%)",
        }}
      />
    </div>
  );
}
