// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "Shop", href: "#shop" },
  { label: "About", href: "#about" },
];

export default function Navbar({ cartCount = 0, onCartClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-gray-950/90 backdrop-blur-xl shadow-lg border-b border-white/5"
          : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <a href="#hero" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            📚
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Dusty<span className="text-indigo-400">Shelf</span>
          </span>
        </a>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <button onClick={onCartClick} className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Login (desktop) */}
          <a
            href="#"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20"
          >
            Login
          </a>

          {/* Hamburger (mobile) */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-950/95 backdrop-blur-xl border-b border-white/5"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#"
                className="block mt-2 px-4 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl text-center"
              >
                Login
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
