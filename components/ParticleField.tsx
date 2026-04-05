"use client";

const PARTICLE_COUNT = 40;

function makeParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const x = ((i * 37 + 17) % 100);
    const y = ((i * 53 + 29) % 100);
    const size = 1.5 + (i % 4) * 0.8;
    const duration = 8 + (i % 7) * 2;
    const driftY = 10 + (i % 5) * 4;
    const driftX = -6 + (i % 11) * 1.2;
    const opStart = 0.08 + (i % 6) * 0.03;
    const opEnd = 0.15 + (i % 4) * 0.05;
    const delay = (i % 8) * -1.5;

    return { x, y, size, duration, driftY, driftX, opStart, opEnd, delay };
  });
}

const particles = makeParticles();

export function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle bg-slate-400/30 dark:bg-blue-300/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            "--duration": `${p.duration}s`,
            "--drift-y": `${p.driftY}px`,
            "--drift-x": `${p.driftX}px`,
            "--particle-opacity-start": p.opStart,
            "--particle-opacity-end": p.opEnd,
            animationDelay: `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
