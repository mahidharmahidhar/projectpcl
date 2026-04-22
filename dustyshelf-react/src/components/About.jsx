// src/components/About.jsx
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: "💸",
    title: "Up to 80% Off",
    desc: "Buy books at a fraction of their original cost and save big on your education.",
  },
  {
    icon: "♻️",
    title: "Eco Friendly",
    desc: "Give books a second life. Reduce paper waste and help the environment.",
  },
  {
    icon: "📍",
    title: "Near Jain University",
    desc: "Conveniently located in Jayanagar, Bangalore — right where students need us.",
  },
  {
    icon: "🤝",
    title: "Trusted Community",
    desc: "A student-run platform built on trust, transparency and accessibility.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="py-20 px-4 sm:px-6 lg:px-8"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.05) 50%, transparent 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
              Our Story
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">
              About{" "}
              <span className="text-gradient">Dusty Shelf</span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-6">
              Dusty Shelf is a student-focused second-hand bookstore that helps students buy and sell books at affordable prices. Located near{" "}
              <span className="text-indigo-300 font-medium">Jain University, Jayanagar, Bangalore</span>, our mission is to make education accessible by reducing book costs.
            </p>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              We believe no student should miss out on knowledge because of high book prices. Every book on our shelf has a story — and now, yours can too.
            </p>

            {/* CTA */}
            <a
              href="#shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20"
            >
              Browse Books →
            </a>
          </motion.div>

          {/* Right — Feature cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {FEATURES.map(({ icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
