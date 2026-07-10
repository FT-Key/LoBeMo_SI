"use client";

import { motion } from "framer-motion";

const techStack = [
  "Next.js",
  "Prisma",
  "PostgreSQL",
  "Tailwind CSS",
  "Docker",
  "TypeScript",
  "Node.js",
  "React",
  "REST API",
  "OAuth 2.0",
];

export function Marquee() {
  return (
    <motion.section
      className="relative overflow-hidden border-y border-border/30 py-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div
        className="flex animate-marquee"
        style={{ "--marquee-duration": "28s" } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center gap-8 pr-8">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="flex items-center gap-8 whitespace-nowrap text-sm font-semibold uppercase tracking-widest text-muted-foreground/60"
            >
              {tech}
              <span className="text-primary/40" aria-hidden="true">
                ✦
              </span>
            </span>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-8 pr-8">
          {techStack.map((tech) => (
            <span
              key={`dup-${tech}`}
              className="flex items-center gap-8 whitespace-nowrap text-sm font-semibold uppercase tracking-widest text-muted-foreground/60"
            >
              {tech}
              <span className="text-primary/40" aria-hidden="true">
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
