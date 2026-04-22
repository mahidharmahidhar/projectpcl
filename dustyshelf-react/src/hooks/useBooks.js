// src/hooks/useBooks.js
// Fetches books from /api/books; falls back to local data if unavailable.

import { useState, useEffect } from "react";
import { BOOKS } from "../data/books";

export function useBooks() {
  const [books, setBooks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBooks() {
      try {
        const res = await fetch("/api/books", { signal: AbortSignal.timeout(3000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setBooks(data);
      } catch {
        // Backend not available — use local fallback
        if (!cancelled) setBooks(BOOKS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBooks();
    return () => { cancelled = true; };
  }, []);

  return { books, loading, error };
}
