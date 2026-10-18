export default function TopFade() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 right-0 z-40 h-28 bg-gradient-to-b from-black/70 via-black/25 to-transparent"
    />
  );
}
