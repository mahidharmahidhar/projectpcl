// src/components/Hero.jsx
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" },
});

const STATS = [
  { value: "500+", label: "Rare Titles" },
  { value: "100%", label: "Authentic" },
  { value: "⭐4.8", label: "Avg Rating" },
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.25) 0%, transparent 70%), #030712",
      }}
    >
      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Blobs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="max-w-3xl mx-auto text-center">

          {/* Badge */}
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              Elegant Independent Bookstore
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 {...fadeUp(0.1)} className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-white mb-6">
            Discover <span className="text-gradient">Timeless Reads</span> & Rare Editions
          </motion.h1>

          {/* Subtext */}
          <motion.p {...fadeUp(0.2)} className="text-gray-400 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Curated collections for literary enthusiasts. Elegant design, rare finds, and seamless shopping for book lovers.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.3)} className="flex flex-wrap justify-center gap-4">
            <a
              href="#shop"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-2xl transition-all duration-200 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95"
            >
              Explore Collection →
            </a>
            <a
              href="#reviews"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Read Reviews
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div {...fadeUp(0.45)} className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center mt-12"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-indigo-400 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
