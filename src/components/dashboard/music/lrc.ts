export type LyricLine = { text: string; start: number; end: number };

export function parseLRC(text: string): LyricLine[] {
  const lines: Array<{ text: string; start: number }> = [];
  for (const raw of text.split("\n")) {
    const m = raw.match(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]\s*(.*)/);
    if (!m || !m[4]?.trim()) continue;
    let ms = (parseInt(m[1]) * 60 + parseInt(m[2])) * 1000;
    const frac = m[3] ?? "";
    if (frac.length === 3) ms += parseInt(frac);
    else if (frac.length === 2) ms += parseInt(frac) * 10;
    else if (frac.length === 1) ms += parseInt(frac) * 100;
    lines.push({ text: m[4].trim().slice(0, 300), start: ms });
  }
  lines.sort((a, b) => a.start - b.start);
  return lines.slice(0, 300).map((l, i) => ({
    text: l.text,
    start: l.start,
    end: lines[i + 1]?.start ?? l.start + 4000,
  }));
}

/** Turn stored lyric lines back into LRC text so they can be edited by hand. */
export function toLRC(lines: LyricLine[] | null | undefined): string {
  if (!lines?.length) return "";
  return lines
    .map((l) => {
      const total = Math.max(0, Math.round(l.start));
      const m = Math.floor(total / 60000);
      const s = Math.floor((total % 60000) / 1000);
      const cs = Math.floor((total % 1000) / 10);
      return `[${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}] ${l.text}`;
    })
    .join("\n");
}
