// src/components/CategoryFilter.jsx
import { motion } from "framer-motion";

export default function CategoryFilter({ categories, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {categories.map((cat) => (
        <motion.button
          key={cat}
          whileTap={{ scale: 0.94 }}
          onClick={() => onChange(cat)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
            active === cat
              ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30"
              : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-indigo-500/40"
          }`}
        >
          {cat}
        </motion.button>
      ))}
    </div>
  );
}
