export function trackVisibility(el: Element | null) {
  const state = { visible: true };
  if (!el || typeof IntersectionObserver === "undefined") {
    return { state, stop: () => {} };
  }
  const io = new IntersectionObserver(([entry]) => {
    state.visible = entry.isIntersecting;
  });
  io.observe(el);
  return { state, stop: () => io.disconnect() };
}
