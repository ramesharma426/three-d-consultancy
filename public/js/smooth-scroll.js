// Inertia-smooths wheel/touch scroll and eases in-page anchor navigation
// (falls back to plain native scrolling if the vendor script fails to load).
// Elements marked [data-lenis-prevent] (the carousel, the lightbox) opt out
// so their own touch/scroll handling isn't hijacked.
var lenis = typeof Lenis !== 'undefined' ? new Lenis({ anchors: true, autoRaf: true }) : null;
