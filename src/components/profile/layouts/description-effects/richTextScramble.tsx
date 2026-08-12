import { cloneElement, isValidElement, type ReactNode } from "react";

type ElementProps = {
  children?: ReactNode;
  dangerouslySetInnerHTML?: { __html: string };
};

export type ScrambleState = {
  /** Running count of visible characters seen so far, in document order. */
  index: number;
  /** Characters before this index show their real glyph; the rest scramble. */
  settled: number;
  /** Supplies a replacement glyph for a scrambling character. */
  glyph: () => string;
};

/** Glyphs are user-visible text going back into an HTML string — escape them. */
function escapeGlyph(ch: string): string {
  if (ch === "&") return "&amp;";
  if (ch === "<") return "&lt;";
  if (ch === ">") return "&gt;";
  return ch;
}

/**
 * Rewrite the visible characters of a generated HTML string, leaving tags and
 * structure untouched.
 *
 * Tags pass through verbatim so `<strong>` and friends keep wrapping the same
 * span of text. Entities (`&amp;`) are one visible character and are swapped
 * atomically — never split. Spaces are preserved so word shapes don't collapse
 * into one run while scrambling.
 */
export function scrambleHtml(html: string, state: ScrambleState): string {
  let out = "";
  let i = 0;

  while (i < html.length) {
    if (html[i] === "<") {
      const end = html.indexOf(">", i);
      if (end === -1) break;
      out += html.slice(i, end + 1);
      i = end + 1;
      continue;
    }

    let ch: string;
    let width: number;

    if (html[i] === "&") {
      const end = html.indexOf(";", i);
      // A run this short can only be an entity; anything longer is a stray "&".
      if (end !== -1 && end - i <= 10) {
        ch = html.slice(i, end + 1);
        width = ch.length;
      } else {
        ch = html[i];
        width = 1;
      }
    } else {
      ch = html[i];
      width = 1;
    }

    if (ch === " " || state.index < state.settled) {
      out += ch;
    } else {
      out += escapeGlyph(state.glyph());
    }

    state.index += 1;
    i += width;
  }

  return out;
}

/**
 * Rebuild a rendered bio tree with its visible characters scrambled, keeping
 * every wrapper, inline tag and line break exactly where it is.
 *
 * The username version of this effect flattens its child to a plain string via
 * extractText and swaps it wholesale. That can't work here: the bio carries
 * bold/underline runs, bullet rows and <br>s, so flattening would drop all the
 * formatting and collapse it onto a single line. Walking the tree instead means
 * only the characters change — the layout is byte-for-byte stable, which also
 * stops the card resizing mid-scramble.
 */
export function scrambleRichText(node: ReactNode, state: ScrambleState): ReactNode {
  if (node === null || node === undefined || typeof node === "boolean") return node;

  if (typeof node === "string" || typeof node === "number") {
    const text = String(node);
    let out = "";
    for (const ch of text) {
      out += ch === " " || state.index < state.settled ? ch : state.glyph();
      state.index += 1;
    }
    return out;
  }

  if (Array.isArray(node)) {
    return node.map((child, i) => {
      const out = scrambleRichText(child, state);
      // renderFormattedText's inner spans are static JSX children with no key;
      // once mapped into a dynamic array React wants one.
      return isValidElement(out) && out.key === null
        ? cloneElement(out, { key: `sc-${i}` })
        : out;
    });
  }

  if (isValidElement<ElementProps>(node)) {
    const { dangerouslySetInnerHTML, children } = node.props;

    if (dangerouslySetInnerHTML) {
      return cloneElement(node, {
        dangerouslySetInnerHTML: { __html: scrambleHtml(dangerouslySetInnerHTML.__html, state) },
      });
    }

    if (children !== undefined) {
      return cloneElement(node, undefined, scrambleRichText(children, state));
    }

    return node;
  }

  return node;
}
