import React, { useEffect, useRef } from 'react';

interface GoldenDustParticlesProps {
  className?: string;
  isQuietMode?: boolean;
  playerPos?: { x: number; y: number };
  isPlayerMoving?: boolean;
}

interface Particle {
  x: number;
  y: number;
  baseX: number;
  radius: number;
  speedY: number;
  speedX: number;
  angle: number;
  angleSpeed: number;
  amplitude: number;
  alpha: number;
  baseAlpha: number;
  alphaSpeed: number;
  color: string;
  glowSize: number;
}

// Warm authentic heritage golden palette
const DUST_COLORS = [
  '255, 224, 130', // Pale gold (#FFE082)
  '245, 158, 11',  // Warm amber (#F59E0B)
  '253, 230, 138', // Soft sunlight (#FDE68A)
  '230, 194, 128', // Desert sandstone gold (#E6C280)
  '217, 119, 6',   // Rich heritage bronze gold (#D97706)
];

export const GoldenDustParticles: React.FC<GoldenDustParticlesProps> = ({
  className = 'absolute inset-0 w-full h-full pointer-events-none z-35',
  isQuietMode = false,
  playerPos,
  isPlayerMoving = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animIdRef = useRef<number | null>(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas accurately
    const updateSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;

      // Handle retina / high-DPI displays cleanly
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      dimensionsRef.current = { width, height };

      // Initialize or scale particles
      const count = isQuietMode ? 28 : 55;
      if (particlesRef.current.length === 0 || Math.abs(particlesRef.current.length - count) > 5) {
        particlesRef.current = Array.from({ length: count }, () =>
          createParticle(width, height)
        );
      }
    };

    const createParticle = (w: number, h: number, spawnFromBottom = false): Particle => {
      const radius = 0.8 + Math.random() * 2.2;
      const baseAlpha = 0.2 + Math.random() * 0.45;
      const color = DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)];

      return {
        x: Math.random() * w,
        y: spawnFromBottom ? h + Math.random() * 20 : Math.random() * h,
        baseX: Math.random() * w,
        radius,
        speedY: 0.18 + Math.random() * 0.38, // gentle upward drift
        speedX: (Math.random() - 0.5) * 0.25, // slight lateral drift
        angle: Math.random() * Math.PI * 2,
        angleSpeed: 0.01 + Math.random() * 0.02,
        amplitude: 15 + Math.random() * 35,
        alpha: baseAlpha * (0.5 + Math.random() * 0.5),
        baseAlpha,
        alphaSpeed: 0.015 + Math.random() * 0.025,
        color,
        glowSize: radius > 1.8 ? radius * 2.5 : 0,
      };
    };

    updateSize();

    // ResizeObserver for reliable dimension updates on resize or responsive changes
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Animation Loop
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 2.5);
      lastTime = now;

      const { width, height } = dimensionsRef.current;
      if (width === 0 || height === 0) {
        animIdRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;

      // Optional gentle air displacement from moving character
      let px = -1000;
      let py = -1000;
      if (playerPos && isPlayerMoving) {
        px = (playerPos.x / 100) * width;
        py = (playerPos.y / 100) * height;
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Wave motion (floating dust motes in sunlit air)
        p.angle += p.angleSpeed * dt;
        p.y -= p.speedY * dt;
        p.x = p.baseX + Math.sin(p.angle) * p.amplitude;
        p.baseX += p.speedX * dt;

        // Interactive breeze from moving player
        if (isPlayerMoving) {
          const dx = p.x - px;
          const dy = p.y - py;
          const distSq = dx * dx + dy * dy;
          const maxDist = 90;
          if (distSq < maxDist * maxDist && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / maxDist) * 1.8 * dt;
            p.baseX += (dx / dist) * force;
            p.y -= Math.abs(dy / dist) * force * 0.8;
          }
        }

        // Shimmering / pulsing opacity
        p.alpha += Math.sin(p.angle * 1.8) * p.alphaSpeed * dt;
        const currentAlpha = Math.max(0.08, Math.min(p.baseAlpha, p.alpha));

        // Respawn if drifted off the top or sides
        if (p.y < -30) {
          p.y = height + 10 + Math.random() * 20;
          p.baseX = Math.random() * width;
          p.x = p.baseX;
        } else if (p.x < -40) {
          p.baseX = width + 20;
          p.x = p.baseX;
        } else if (p.x > width + 40) {
          p.baseX = -20;
          p.x = p.baseX;
        }

        // Draw dust particle
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${currentAlpha.toFixed(3)})`;
        ctx.fill();

        // Soft halo glow for larger sunlit motes
        if (p.glowSize > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.glowSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${(currentAlpha * 0.22).toFixed(3)})`;
          ctx.fill();
        }
        ctx.restore();
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [isQuietMode, isPlayerMoving, playerPos]);

  return (
    <canvas
      ref={canvasRef}
      id="village-golden-dust-canvas"
      aria-hidden="true"
      className={className}
      style={{
        pointerEvents: 'none',
      }}
    />
  );
};
