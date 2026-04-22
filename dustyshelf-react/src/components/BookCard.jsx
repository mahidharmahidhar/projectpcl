// src/components/BookCard.jsx
import { useState } from "react";
import { motion } from "framer-motion";

const CONDITION_STYLES = {
  "Like New": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "Good": "bg-blue-500/15    text-blue-400    border-blue-500/20",
  "Acceptable": "bg-amber-500/15   text-amber-400   border-amber-500/20",
};

function CoverImage({ isbn, title }) {
  const [errored, setErrored] = useState(false);

  const src = isbn && !errored
    ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
    : null;

  if (!src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex flex-col items-center justify-center gap-2">
        <span className="text-4xl">📚</span>
        <span className="text-xs text-gray-500 text-center px-2 line-clamp-2">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      onError={() => setErrored(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
  );
}

export default function BookCard({ book, onAddToCart, onViewDetails }) {
  const [added, setAdded] = useState(false);

  function handleAdd(e) {
    e.stopPropagation();
    onAddToCart?.(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      onClick={() => onViewDetails?.(book.id)}
      className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-indigo-500/30 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
        <CoverImage isbn={book.isbn} title={book.title} />

        {/* Badges */}
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CONDITION_STYLES[book.condition] ?? "bg-gray-500/15 text-gray-400"}`}>
            {book.condition}
          </span>
        </div>
        {book.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <svg className="w-3 h-3 fill-yellow-400" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-[10px] font-bold text-white">{book.rating}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 mb-0.5">
          {book.category}
        </p>
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-0.5 flex-1">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{book.author}</p>

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-base font-bold text-white">₹{book.price.toLocaleString()}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${added
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600/80 hover:bg-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-500/25"
              }`}
          >
            {added ? "✓" : "+"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(book.id);
            }}
            className="flex-1 py-2 rounded-xl text-xs font-bold border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 transition-all"
          >
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
}
