// ── toast.js ──────────────────────────────────────────────────────────────────
// Lightweight toast notification system
// ─────────────────────────────────────────────────────────────────────────────

let toastContainer = null;

function ensureContainer() {
  if (toastContainer) return toastContainer;
  toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  toastContainer.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    display: flex; flex-direction: column; gap: 10px;
    pointer-events: none;
  `;
  document.body.appendChild(toastContainer);
  return toastContainer;
}

const icons = {
  success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
  error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
  info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
};

const colors = {
  success: "bg-emerald-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-indigo-600 text-white",
};

export function showToast(message, type = "info", duration = 3000) {
  const container = ensureContainer();
  const toast = document.createElement("div");

  toast.className = `
    flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl
    text-sm font-medium pointer-events-auto
    ${colors[type] || colors.info}
    transform translate-x-full transition-transform duration-300 ease-out
  `;

  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = "translateX(0)";
    });
  });

  setTimeout(() => {
    toast.style.transform = "translateX(calc(100% + 24px))";
    toast.style.opacity = "0";
    toast.style.transition = "transform 0.3s ease-in, opacity 0.3s ease-in";
    setTimeout(() => toast.remove(), 350);
  }, duration);
}
