
const DANGEROUS_TAG_RE =
  /<\s*\/?\s*(script|foreignObject|iframe|object|embed|handler|set|animate|animateTransform|animateMotion|use|audio|video|link|style|meta)\b[^>]*>/gi;

const EVENT_ATTR_RE = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

const DANGEROUS_ATTR_RE =
  /\s+(?:xlink:href|href|src|from|to|values|begin|attributename|attributetype)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

const DANGEROUS_VALUE_RE =
  /(?:javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|expression\s*\(|-moz-binding|@import|url\s*\(\s*['"]?\s*(?:javascript|data):)/i;

const EXTERNAL_URL_RE =
  /(?:\b(?:href|src|xlink:href)\s*=\s*(?:"\s*(?:https?:)?\/\/[^"]*"|'\s*(?:https?:)?\/\/[^']*'))/gi;

function stripDangerousChars(svg: string): string {
  return svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "")
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<!ENTITY[\s\S]*?>/gi, "");
}

export type SanitizeResult =
  | { ok: true; svg: string }
  | { ok: false; reason: string };

export function sanitizeSvg(raw: string): SanitizeResult {
  if (typeof raw !== "string" || raw.length === 0) {
    return { ok: false, reason: "empty" };
  }

  const cleaned = stripDangerousChars(raw);

  if (!/<\s*svg[\s>]/i.test(cleaned)) {
    return { ok: false, reason: "no-svg-root" };
  }

  if (DANGEROUS_TAG_RE.test(cleaned)) {
    DANGEROUS_TAG_RE.lastIndex = 0;
    return { ok: false, reason: "dangerous-tag" };
  }
  DANGEROUS_TAG_RE.lastIndex = 0;

  if (EVENT_ATTR_RE.test(cleaned)) {
    EVENT_ATTR_RE.lastIndex = 0;
    return { ok: false, reason: "event-handler" };
  }
  EVENT_ATTR_RE.lastIndex = 0;

  if (DANGEROUS_ATTR_RE.test(cleaned)) {
    DANGEROUS_ATTR_RE.lastIndex = 0;
    return { ok: false, reason: "dangerous-attribute" };
  }
  DANGEROUS_ATTR_RE.lastIndex = 0;

  if (DANGEROUS_VALUE_RE.test(cleaned)) {
    return { ok: false, reason: "dangerous-value" };
  }

  if (EXTERNAL_URL_RE.test(cleaned)) {
    EXTERNAL_URL_RE.lastIndex = 0;
    return { ok: false, reason: "external-reference" };
  }
  EXTERNAL_URL_RE.lastIndex = 0;

  const styleBlocks = cleaned.match(/<style[\s\S]*?<\/style>/gi);
  if (styleBlocks && styleBlocks.join("").length > 8_000) {
    return { ok: false, reason: "style-too-large" };
  }

  return { ok: true, svg: cleaned };
}