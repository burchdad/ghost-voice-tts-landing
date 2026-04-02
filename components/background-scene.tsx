"use client";

import { motion } from "framer-motion";

const particles = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  width: 6 + (index % 4) * 3,
  height: 6 + ((index + 2) % 4) * 3,
  left: `${8 + index * 5.4}%`,
  top: `${10 + (index % 5) * 15}%`,
  duration: 8 + (index % 5),
  delay: index * 0.35,
}));

const waveform = [32, 48, 26, 70, 38, 88, 42, 64, 28, 94, 35, 72, 26, 54, 32, 84, 40, 62, 24, 50, 30, 76, 34, 58];

export function BackgroundScene() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.22),transparent_26%),radial-gradient(circle_at_80%_15%,rgba(56,189,248,0.18),transparent_24%)]" />
      <div className="absolute inset-0 bg-grid bg-[size:64px_64px] opacity-30" />

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-br from-fuchsia-400/70 to-sky-400/50 blur-[2px]"
          style={{
            width: particle.width,
            height: particle.height,
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            y: [0, -18, 0],
            x: [0, 12, 0],
            opacity: [0.25, 0.8, 0.25],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="absolute inset-x-10 bottom-10 top-24 flex items-end gap-2 opacity-90 sm:gap-3">
        {waveform.map((height, index) => (
          <motion.span
            key={index}
            className="wave-line w-2 flex-1 sm:w-3"
            style={{ height: `${height}%` }}
            animate={{
              scaleY: [0.78, 1.12, 0.82],
              opacity: [0.45, 1, 0.55],
            }}
            transition={{
              duration: 2.8 + (index % 4) * 0.35,
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 0.08,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="grid-fade absolute inset-x-0 bottom-0 h-40" />
    </div>
  );
}
