"use client";

import { useEffect, useRef } from "react";
import { motion, type Variants } from "framer-motion";

const BoltIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2 + 0.5,
      duration: 0.8,
      ease: "easeInOut",
    },
  }),
};

class Particle {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  size: number;
  color: string;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  mouse: { x: number | null; y: number | null; radius: number };

  constructor(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    mouse: { x: number | null; y: number | null; radius: number },
    x: number,
    y: number,
    directionX: number,
    directionY: number,
    size: number,
    color: string
  ) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.mouse = mouse;
    this.x = x;
    this.y = y;
    this.directionX = directionX;
    this.directionY = directionY;
    this.size = size;
    this.color = color;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }

  update() {
    if (this.x > this.canvas.width || this.x < 0) {
      this.directionX = -this.directionX;
    }
    if (this.y > this.canvas.height || this.y < 0) {
      this.directionY = -this.directionY;
    }

    if (this.mouse.x !== null && this.mouse.y !== null) {
      const dx = this.mouse.x - this.x;
      const dy = this.mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.mouse.radius + this.size) {
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (this.mouse.radius - distance) / this.mouse.radius;
        this.x -= forceDirectionX * force * 5;
        this.y -= forceDirectionY * force * 5;
      }
    }

    this.x += this.directionX;
    this.y += this.directionY;
    this.draw();
  }
}

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse: { x: number | null; y: number | null; radius: number } = {
      x: null,
      y: null,
      radius: 200,
    };

    const init = () => {
      particles = [];
      const numberOfParticles = (canvas.height * canvas.width) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * (canvas.width - size * 2 - size * 2) + size * 2;
        const y = Math.random() * (canvas.height - size * 2 - size * 2) + size * 2;
        const directionX = Math.random() * 0.4 - 0.2;
        const directionY = Math.random() * 0.4 - 0.2;
        const color = "rgba(191, 128, 255, 0.8)";
        particles.push(
          new Particle(ctx, canvas, mouse, x, y, directionX, directionY, size, color)
        );
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const connect = () => {
      let opacityValue = 1;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const distance =
            (particles[a].x - particles[b].x) * (particles[a].x - particles[b].x) +
            (particles[a].y - particles[b].y) * (particles[a].y - particles[b].y);

          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            opacityValue = 1 - distance / 20000;

            const dxMouseA = particles[a].x - (mouse.x ?? 0);
            const dyMouseA = particles[a].y - (mouse.y ?? 0);
            const distanceMouseA = Math.sqrt(dxMouseA * dxMouseA + dyMouseA * dyMouseA);

            if (mouse.x !== null && distanceMouseA < mouse.radius) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue})`;
            } else {
              ctx.strokeStyle = `rgba(200, 150, 255, ${opacityValue})`;
            }

            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      connect();
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);

    init();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

      <div className="relative z-10 text-center p-6">
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 backdrop-blur-sm"
        >
          <BoltIcon className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-200">
            강산이엔지 업무지원 시스템
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400"
        >
          KANGSAN WORK
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto text-lg text-gray-400 mb-10"
        >
          외근계획표부터 연간 일정, 개별 업무보고까지. 강산이엔지 임직원을 위한 업무 도구를
          한 곳에 모았습니다.
        </motion.p>

        <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
          <button className="px-8 py-4 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2 mx-auto">
            업무 도구 살펴보기
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
