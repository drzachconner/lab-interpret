import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface BackgroundVariant {
  variant?: 'hero' | 'clinical' | 'minimal';
  intensity?: 'low' | 'medium' | 'high';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
}

const UnifiedBackground = ({ 
  variant = 'hero', 
  intensity = 'medium' 
}: BackgroundVariant) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const w = parent.clientWidth;
      const h = parent.clientHeight;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      particles.current = [];
      const parent = canvas.parentElement;
      const w = parent?.clientWidth ?? 0;
      const h = parent?.clientHeight ?? 0;

      // Adjust particle count based on intensity and variant
      const baseCount = {
        low: 15,
        medium: 25,
        high: 40
      }[intensity];

      const count = Math.max(baseCount, Math.floor((w * h) / 20000));

      for (let i = 0; i < count; i++) {
        particles.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.4 + 0.2,
          size: Math.random() * 2 + 1.5,
        });
      }
    };

    const animate = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth ?? canvas.width / dpr;
      const h = parent?.clientHeight ?? canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Draw particle with glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        
        // Color varies by variant
        const colors = {
          hero: `rgba(59,130,246,${0.6 * p.opacity})`, // Blue
          clinical: `rgba(34,197,94,${0.5 * p.opacity})`, // Green
          minimal: `rgba(100,116,139,${0.4 * p.opacity})` // Slate
        };
        
        grd.addColorStop(0, colors[variant]);
        grd.addColorStop(1, `rgba(59,130,246,0)`);

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [variant, intensity]);

  // Base gradient configs for different variants
  const gradientConfigs = {
    hero: {
      base: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100",
      overlay: "bg-gradient-to-tr from-blue-200/30 via-transparent to-purple-200/30",
      blobs: {
        primary: "bg-blue-500/30",
        secondary: "bg-purple-500/30"
      }
    },
    clinical: {
      base: "bg-gradient-to-br from-green-50/70 via-white to-emerald-50/70", 
      overlay: "bg-gradient-to-tr from-green-100/20 via-transparent to-teal-100/20",
      blobs: {
        primary: "bg-green-400/20",
        secondary: "bg-teal-400/20"
      }
    },
    minimal: {
      base: "bg-gradient-to-br from-slate-50/50 via-white to-gray-50/50",
      overlay: "bg-gradient-to-tr from-slate-100/10 via-transparent to-gray-100/10",
      blobs: {
        primary: "bg-slate-400/15",
        secondary: "bg-gray-400/15"
      }
    }
  };

  const config = gradientConfigs[variant];

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Base gradient background */}
      <div className={`absolute inset-0 ${config.base}`}>
        {intensity !== 'low' && (
          <motion.div
            className={`absolute inset-0 ${config.overlay}`}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </div>

      {/* Animated blobs - only for hero and clinical variants */}
      {variant !== 'minimal' && intensity !== 'low' && (
        <>
          <motion.div
            className={`absolute w-72 h-72 rounded-full ${config.blobs.primary} blur-3xl`}
            style={{ top: '-5rem', left: '-5rem' }}
            animate={{
              x: [-20, 20, -20],
              y: [-10, 10, -10],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className={`absolute w-96 h-96 rounded-full ${config.blobs.secondary} blur-3xl`}
            style={{ bottom: '-2.5rem', right: '-2.5rem' }}
            animate={{
              x: [10, -10, 10],
              y: [15, -15, 15],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </>
      )}

      {/* Canvas particles - reduced opacity for minimal variant */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 pointer-events-none ${variant === 'minimal' ? 'opacity-30' : 'opacity-60'}`}
        style={{ 
          mixBlendMode: variant === 'minimal' ? 'normal' : 'screen',
        }}
      />

      {/* Subtle grid pattern - only for clinical variant */}
      {variant === 'clinical' && (
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      {/* DNA-like SVG paths - only for hero variant with high intensity */}
      {variant === 'hero' && intensity === 'high' && (
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <motion.path
            d="M 50 100 Q 150 50 250 100 T 450 100"
            stroke="url(#heroGradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.path
            d="M 100 200 Q 200 150 300 200 T 500 200"
            stroke="url(#heroGradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", delay: 1.5 }}
          />
          <defs>
            <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "#3B82F6", stopOpacity: 0.3 }} />
              <stop offset="50%" style={{ stopColor: "#8B5CF6", stopOpacity: 0.5 }} />
              <stop offset="100%" style={{ stopColor: "#3B82F6", stopOpacity: 0.3 }} />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
};

export default UnifiedBackground;