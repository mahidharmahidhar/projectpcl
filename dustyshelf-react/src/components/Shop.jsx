// src/components/Shop.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import BookCard from "./BookCard";
import CategoryFilter from "./CategoryFilter";
import { useBooks } from "../hooks/useBooks";
import { CATEGORIES } from "../data/books";

// Loading skeleton
function SkeletonCard() {
  return (
    <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-gray-800" />
      <div className="p-3 space-y-2">
        <div className="h-2 bg-gray-800 rounded w-1/3" />
        <div className="h-3 bg-gray-800 rounded w-4/5" />
        <div className="h-2 bg-gray-800 rounded w-1/2" />
        <div className="h-8 bg-gray-800 rounded-xl mt-3" />
      </div>
    </div>
  );
}

export default function Shop({ onAddToCart, onViewDetails }) {
  const { books, loading } = useBooks();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = books.filter((b) => {
    const matchCat = activeCategory === "All" || b.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <section id="shop" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <span className="inline-block px-4 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
          Browse Collection
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Our Book Shop
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Handpicked second-hand books for students — at unbeatable prices.
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 space-y-4"
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 max-w-md">
          <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books, authors…"
            className="bg-transparent text-sm text-white placeholder-gray-600 outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-600 hover:text-gray-400">
              ✕
            </button>
          )}
        </div>

        {/* Category filters */}
        <CategoryFilter
          categories={CATEGORIES}
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </motion.div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-6">
          {filtered.length} book{filtered.length !== 1 ? "s" : ""} found
          {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
          {search ? ` for "${search}"` : ""}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-400 font-medium">No books found</p>
          <button
            onClick={() => { setSearch(""); setActiveCategory("All"); }}
            className="mt-4 text-indigo-400 text-sm hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} onAddToCart={onAddToCart} onViewDetails={onViewDetails} />
          ))}
        </div>
      )}
    </section>
  );
}
