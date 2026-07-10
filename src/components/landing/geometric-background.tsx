export function GeometricBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-40 -right-40 h-[600px] w-[600px] rotate-45 opacity-[0.06]"
        style={{
          background:
            "linear-gradient(135deg, #00D4FF 0%, #00364A 50%, transparent 100%)",
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        }}
      />

      <div
        className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rotate-12 opacity-[0.04]"
        style={{
          background:
            "linear-gradient(45deg, #c8f02d 0%, #3d4d0a 50%, transparent 100%)",
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        }}
      />

      <div
        className="absolute top-1/3 left-1/2 h-[700px] w-[700px] -translate-x-1/2 opacity-[0.03]"
        style={{
          background:
            "radial-gradient(circle at center, #00D4FF 0%, transparent 70%)",
        }}
      />

      <div className="absolute top-1/4 right-1/3 h-px w-80 rotate-[30deg] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="absolute bottom-1/3 left-1/3 h-px w-64 -rotate-[25deg] bg-gradient-to-r from-transparent via-accent/15 to-transparent" />

      <div
        className="absolute top-2/3 right-1/6 h-[350px] w-[350px] opacity-[0.03]"
        style={{
          background:
            "linear-gradient(180deg, #00D4FF 0%, transparent 100%)",
          clipPath: "polygon(50% 0%, 100% 75%, 50% 100%, 0% 75%)",
        }}
      />

      <div className="absolute inset-0 opacity-[0.015]">
        <svg className="h-full w-full" viewBox="0 0 1000 1000">
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="#00D4FF"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="1000" height="1000" fill="url(#grid)" />
        </svg>
      </div>

      <div className="absolute left-1/2 top-0 h-full w-px opacity-[0.015]">
        <div className="h-full w-full bg-gradient-to-b from-transparent via-primary to-transparent" />
        <div className="absolute top-0 h-32 w-full animate-scanline bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
      </div>
    </div>
  );
}
