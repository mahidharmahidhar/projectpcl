// ── toast.js ──────────────────────────────────────────────────────────────────
// Modern toast notification + animated success popup system
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

// Inject keyframe animations once
function injectStyles() {
  if (document.getElementById("toast-global-styles")) return;
  const style = document.createElement("style");
  style.id = "toast-global-styles";
  style.textContent = `
    @keyframes toast-slide-in {
      from { transform: translateX(calc(100% + 24px)); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
    @keyframes toast-slide-out {
      from { transform: translateX(0); opacity: 1; }
      to   { transform: translateX(calc(100% + 24px)); opacity: 0; }
    }
    @keyframes popup-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes popup-scale-in {
      from { transform: scale(0.7) translateY(20px); opacity: 0; }
      to   { transform: scale(1) translateY(0); opacity: 1; }
    }
    @keyframes popup-scale-out {
      from { transform: scale(1); opacity: 1; }
      to   { transform: scale(0.8); opacity: 0; }
    }
    @keyframes checkmark-draw {
      from { stroke-dashoffset: 56; }
      to   { stroke-dashoffset: 0; }
    }
    @keyframes circle-draw {
      from { stroke-dashoffset: 283; }
      to   { stroke-dashoffset: 0; }
    }
    @keyframes confetti-fall {
      0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(60px) rotate(720deg); opacity: 0; }
    }
    .toast-enter { animation: toast-slide-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
    .toast-exit  { animation: toast-slide-out 0.3s ease-in forwards; }
  `;
  document.head.appendChild(style);
}

const icons = {
  success: `<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`,
  error: `<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>`,
  info: `<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  warning: `<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
};

const bgColors = {
  success: "background: linear-gradient(135deg, #1A3C34 0%, #2d5a4e 100%);",
  error: "background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);",
  info: "background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);",
  warning: "background: linear-gradient(135deg, #d97706 0%, #b45309 100%);",
};

// ── Toast Notification ────────────────────────────────────────────────────────
export function showToast(message, type = "info", duration = 3500) {
  injectStyles();
  const container = ensureContainer();
  const toast = document.createElement("div");

  toast.style.cssText = `
    display: flex; align-items: center; gap: 12px;
    padding: 14px 20px; border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1);
    font-size: 14px; font-weight: 600; color: white;
    pointer-events: auto; max-width: 380px;
    ${bgColors[type] || bgColors.info}
  `;
  toast.classList.add("toast-enter");

  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("toast-enter");
    toast.classList.add("toast-exit");
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ── Animated Success Popup (Full Screen Overlay) ──────────────────────────────
// Used for Registration Success, Login Success, Order Placed Successfully
export function showSuccessPopup(title, subtitle = "", options = {}) {
  injectStyles();
  const {
    redirectUrl = null,
    redirectDelay = 2500,
    buttonText = null,
    onClose = null,
  } = options;

  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "success-popup-overlay";
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
    animation: popup-fade-in 0.3s ease forwards;
    padding: 16px;
  `;

  // Create confetti particles
  let confettiHTML = '';
  const confettiColors = ['#B8860B', '#1A3C34', '#4ade80', '#fbbf24', '#f87171', '#60a5fa'];
  for (let i = 0; i < 24; i++) {
    const color = confettiColors[i % confettiColors.length];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.8;
    const size = 4 + Math.random() * 6;
    confettiHTML += `<div style="
      position: absolute; top: 20%; left: ${left}%;
      width: ${size}px; height: ${size}px; border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      background: ${color};
      animation: confetti-fall ${1.2 + Math.random() * 1}s ${delay}s ease-out forwards;
      opacity: 0; transform: translateY(-10px);
    "></div>`;
  }

  overlay.innerHTML = `
    <div style="
      background: #FDFCF8; border-radius: 2.5rem; padding: 3rem 2.5rem;
      max-width: 420px; width: 100%; text-align: center;
      box-shadow: 0 30px 80px rgba(0,0,0,0.25);
      animation: popup-scale-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      position: relative; overflow: hidden;
    ">
      ${confettiHTML}
      <!-- Animated checkmark -->
      <div style="margin: 0 auto 1.5rem; width: 80px; height: 80px; position: relative;">
        <svg viewBox="0 0 100 100" style="width: 80px; height: 80px;">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1A3C34" stroke-width="3"
                  stroke-dasharray="283" stroke-dashoffset="283"
                  style="animation: circle-draw 0.6s 0.1s ease forwards;" />
          <path d="M30 52 L44 66 L70 38" fill="none" stroke="#B8860B" stroke-width="4"
                stroke-linecap="round" stroke-linejoin="round"
                stroke-dasharray="56" stroke-dashoffset="56"
                style="animation: checkmark-draw 0.4s 0.6s ease forwards;" />
        </svg>
      </div>

      <h2 style="
        font-family: 'Playfair Display', serif; font-size: 1.75rem; font-weight: 700;
        color: #1A3C34; margin-bottom: 0.75rem; line-height: 1.2;
      ">${title}</h2>

      ${subtitle ? `<p style="
        color: #7D6B5D; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1.5rem;
      ">${subtitle}</p>` : ''}

      ${buttonText ? `
        <button id="popup-action-btn" style="
          display: inline-block; background: #1A3C34; color: #FDFCF8;
          padding: 14px 40px; border-radius: 50px; border: none; cursor: pointer;
          font-weight: 700; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
          box-shadow: 0 8px 24px rgba(26,60,52,0.2);
          transition: all 0.2s; margin-top: 0.5rem;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"
        >${buttonText}</button>
      ` : ''}
    </div>
  `;

  document.body.appendChild(overlay);

  // Handle button click
  if (buttonText) {
    document.getElementById("popup-action-btn").addEventListener("click", () => {
      closePopup(overlay);
      if (onClose) onClose();
      if (redirectUrl) window.location.href = redirectUrl;
    });
  }

  // Auto redirect after delay
  if (redirectUrl && !buttonText) {
    setTimeout(() => {
      closePopup(overlay);
      window.location.href = redirectUrl;
    }, redirectDelay);
  }

  // Close on overlay click (outside card)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closePopup(overlay);
      if (onClose) onClose();
    }
  });

  return overlay;
}

function closePopup(overlay) {
  const card = overlay.querySelector("div");
  if (card) {
    card.style.animation = "popup-scale-out 0.25s ease forwards";
  }
  overlay.style.animation = "popup-fade-in 0.25s ease reverse forwards";
  setTimeout(() => overlay.remove(), 300);
}
