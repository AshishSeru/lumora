"use client";

// The signature element: a living orb of warm light. It is Lumora —
// the mentor's presence, the "light" the learner moves toward.
export default function Orb({ size = 180, intensity = 1 }) {
  return (
    <div
      className="relative flex items-center justify-center animate-drift"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* outer halo */}
      <div
        className="absolute rounded-full animate-pulse-glow"
        style={{
          width: size,
          height: size,
          background:
            "radial-gradient(circle, rgba(232,116,59,0.30) 0%, rgba(242,177,121,0.18) 45%, rgba(253,248,243,0) 70%)",
          filter: "blur(6px)",
          opacity: intensity,
        }}
      />
      {/* core */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.42,
          height: size * 0.42,
          background:
            "radial-gradient(circle at 35% 30%, #FFF4E8 0%, #F2B179 32%, #E8743B 68%, #C7531E 115%)",
          boxShadow:
            "0 0 40px rgba(232,116,59,0.45), 0 0 90px rgba(242,177,121,0.35)",
        }}
      />
      {/* inner sheen */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.14,
          height: size * 0.14,
          top: size * 0.3,
          left: size * 0.32,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)",
        }}
      />
    </div>
  );
}
