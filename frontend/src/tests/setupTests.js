// src/tests/setupTests.js
import "@testing-library/jest-dom/vitest";

/* ---------------- Browser-ish polyfills (safe no-ops) ---------------- */

if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},    // deprecated but some libs still call
    removeListener() {},
    dispatchEvent() { return false; },
  });
}

if (typeof window.ResizeObserver !== "function") {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof window.IntersectionObserver !== "function") {
  window.IntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
    root = null; rootMargin = ""; thresholds = [];
  };
}

window.scrollTo = window.scrollTo || (() => {});
window.requestAnimationFrame =
  window.requestAnimationFrame ||
  ((cb) => setTimeout(cb, 0));
window.cancelAnimationFrame =
  window.cancelAnimationFrame ||
  ((id) => clearTimeout(id));

/* ---------------- Crypto + encoders ---------------- */

if (!globalThis.crypto) globalThis.crypto = {};
if (typeof globalThis.crypto.randomUUID !== "function") {
  globalThis.crypto.randomUUID = () => "00000000-0000-4000-8000-000000000000";
}

// Some libs (e.g., router/history) may rely on TextEncoder/Decoder
// Node >=18 has them, but add fallback just in case.
if (typeof globalThis.TextEncoder === "undefined") {
  const { TextEncoder } = await import("util");
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
  const { TextDecoder } = await import("util");
  globalThis.TextDecoder = TextDecoder;
}

/* ---------------- Optional console noise filters ---------------- */
// Comment out if you want to see everything during failures.
/*
const origError = console.error;
console.error = (...args) => {
  const msg = String(args[0] || "");
  // Ignore jsdom warnings about not-implemented features, etc.
  if (msg.includes("Not implemented:")) return;
  origError(...args);
};
*/
