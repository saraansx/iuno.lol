import { cloneElement, isValidElement, type ReactNode } from "react";

type ElementProps = {
  children?: ReactNode;
  dangerouslySetInnerHTML?: { __html: string };
};

export type ScrambleState = {
  index: number;
  settled: number;
  glyph: () => string;
};

function escapeGlyph(ch: string): string {
  if (ch === "&") return "&amp;";
  if (ch === "<") return "&lt;";
  if (ch === ">") return "&gt;";
  return ch;
}

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
