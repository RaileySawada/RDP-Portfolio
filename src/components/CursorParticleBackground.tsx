import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
};

const PARTICLE_GAP = 18;
const CURSOR_RADIUS = 260;
const MAX_SPEED = 1.65;
const FRICTION = 0.94;

export default function CursorParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let animationId = 0;

    const getParticleCount = () => {
      const area = window.innerWidth * window.innerHeight;
      return Math.min(130, Math.max(55, Math.floor(area / 13000)));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from({ length: getParticleCount() }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        r: Math.random() * 1.7 + 1.1,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current.x = event.clientX;
      pointerRef.current.y = event.clientY;
      pointerRef.current.active = true;
    };

    const onPointerLeave = () => {
      pointerRef.current.active = false;
    };

    const limitSpeed = (particle: Particle) => {
      const speed = Math.hypot(particle.vx, particle.vy);

      if (speed > MAX_SPEED) {
        particle.vx = (particle.vx / speed) * MAX_SPEED;
        particle.vy = (particle.vy / speed) * MAX_SPEED;
      }
    };

    const applySeparation = (particle: Particle, index: number) => {
      for (let i = index + 1; i < particles.length; i += 1) {
        const other = particles[i];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.hypot(dx, dy) || 1;

        if (distance < PARTICLE_GAP) {
          const force = (PARTICLE_GAP - distance) / PARTICLE_GAP;
          const pushX = (dx / distance) * force * 0.045;
          const pushY = (dy / distance) * force * 0.045;

          particle.vx += pushX;
          particle.vy += pushY;
          other.vx -= pushX;
          other.vy -= pushY;
        }
      }
    };

    const update = () => {
      frame += 0.008;

      const pointer = pointerRef.current;
      const idleX = width * 0.5 + Math.cos(frame * 1.7) * width * 0.24;
      const idleY = height * 0.45 + Math.sin(frame * 1.25) * height * 0.2;

      particles.forEach((particle, index) => {
        const targetX = pointer.active ? pointer.x : idleX;
        const targetY = pointer.active ? pointer.y : idleY;

        const dx = targetX - particle.x;
        const dy = targetY - particle.y;
        const distance = Math.hypot(dx, dy) || 1;

        if (distance < CURSOR_RADIUS || !pointer.active) {
          const pull = pointer.active
            ? (1 - distance / CURSOR_RADIUS) * 0.035
            : 0.006;

          particle.vx += (dx / distance) * pull;
          particle.vy += (dy / distance) * pull;

          particle.vx += Math.cos(particle.phase + frame * 10) * 0.006;
          particle.vy += Math.sin(particle.phase + frame * 10) * 0.006;
        }

        applySeparation(particle, index);

        particle.vx *= FRICTION;
        particle.vy *= FRICTION;

        limitSpeed(particle);

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(79, 110, 247, 0.42)";
        ctx.fill();
      });
    };

    const animate = () => {
      update();
      draw();
      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        onPointerLeave,
      );
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="cursor-particle-bg" aria-hidden="true" />
  );
}
