import { cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";

type ElementProps = {
  children?: ReactNode;
  style?: CSSProperties;
  dangerouslySetInnerHTML?: { __html: string };
};

/** Untyped text stays in flow so nothing reflows — it's just transparent. */
const HIDDEN: CSSProperties = { opacity: 0 };

/**
 * Split a generated HTML string at `limit` visible characters.
 *
 * `head` gets any tags the cut left open closed off, and `tail` reopens them so
 * the closing tags already sitting in the remainder still balance. The bio is
 * rendered through dangerouslySetInnerHTML, so a plain string slice would land
 * mid-tag. Tags cost nothing against the budget and entities (`&amp;`) count as
 * the single character they render as.
 *
 * Pass Infinity to count without splitting.
 */
export function splitHtml(
  html: string,
  limit: number,
): { head: string; tail: string; visible: number } {
  const open: { name: string; tag: string }[] = [];
  let visible = 0;
  let head = "";
  let i = 0;

  while (i < html.length) {
    if (html[i] === "<") {
      const end = html.indexOf(">", i);
      if (end === -1) break;
      const tag = html.slice(i, end + 1);
      const name = /^<\/?\s*([a-zA-Z0-9]+)/.exec(tag)?.[1]?.toLowerCase();
      if (name && !tag.endsWith("/>")) {
        if (tag[1] === "/") {
          for (let k = open.length - 1; k >= 0; k -= 1) {
            if (open[k].name === name) {
              open.splice(k, 1);
              break;
            }
          }
        } else {
          open.push({ name, tag });
        }
      }
      head += tag;
      i = end + 1;
      continue;
    }

    if (visible >= limit) break;

    if (html[i] === "&") {
      const end = html.indexOf(";", i);
      // A run this short can only be an entity; anything longer is a stray "&".
      if (end !== -1 && end - i <= 10) {
        head += html.slice(i, end + 1);
        i = end + 1;
        visible += 1;
        continue;
      }
    }

    head += html[i];
    i += 1;
    visible += 1;
  }

  let closers = "";
  for (let k = open.length - 1; k >= 0; k -= 1) closers += `</${open[k].name}>`;
  let openers = "";
  for (const t of open) openers += t.tag;

  return {
    head: head + closers,
    tail: i < html.length ? openers + html.slice(i) : "",
    visible,
  };
}

/** Total visible characters in a rendered bio tree. */
export function countRichText(node: ReactNode): number {
  if (node === null || node === undefined || typeof node === "boolean") return 0;
  if (typeof node === "string") return node.length;
  if (typeof node === "number") return String(node).length;
  if (Array.isArray(node)) return node.reduce<number>((sum, n) => sum + countRichText(n), 0);
  if (isValidElement<ElementProps>(node)) {
    const { dangerouslySetInnerHTML, children } = node.props;
    if (dangerouslySetInnerHTML) return splitHtml(dangerouslySetInnerHTML.__html, Infinity).visible;
    return countRichText(children);
  }
  return 0;
}

export type RevealState = {
  /** Visible characters still to reveal. Consumed in document order. */
  left: number;
  caret: ReactNode;
  placed: boolean;
};

function hide(node: ReactNode): ReactNode {
  return <span style={HIDDEN}>{node}</span>;
}

/**
 * Rebuild a rendered bio tree with the first `state.left` visible characters
 * shown, the caret at that boundary, and everything after it transparent.
 *
 * Keeping the untyped remainder in flow is what makes the effect layout-stable:
 * every frame occupies exactly the space the finished bio will, so the card
 * can't grow line by line and the text fills line one before flowing onto line
 * two instead of re-wrapping on every keystroke. The caret is emitted lazily,
 * immediately before the first hidden character, which puts it against the last
 * typed word rather than after any trailing blank lines.
 */
export function revealRichText(node: ReactNode, state: RevealState): ReactNode {
  if (node === null || node === undefined || typeof node === "boolean") return node;

  if (typeof node === "string" || typeof node === "number") {
    const text = String(node);

    // An empty node renders nothing, so it can't host the caret — skipping it
    // is what keeps the caret off a trailing blank line.
    if (text.length === 0) return node;

    if (state.left > text.length) {
      state.left -= text.length;
      return node;
    }

    if (state.left <= 0) {
      if (state.placed) return hide(node);
      state.placed = true;
      return (
        <>
          {state.caret}
          {hide(node)}
        </>
      );
    }

    // Reaching here means the boundary falls inside this node, or exactly at
    // its end — either way the caret belongs right after the last character.
    const head = text.slice(0, state.left);
    const tail = text.slice(state.left);
    state.left = 0;
    state.placed = true;
    return (
      <>
        {head}
        {state.caret}
        {tail.length > 0 ? hide(tail) : null}
      </>
    );
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => {
      const out = revealRichText(child, state);
      // renderFormattedText's inner spans are static JSX children with no key;
      // once mapped into a dynamic array React wants one.
      return isValidElement(out) && out.key === null
        ? cloneElement(out, { key: `rt-${index}` })
        : out;
    });
  }

  if (isValidElement<ElementProps>(node)) {
    const { dangerouslySetInnerHTML, children, style } = node.props;

    if (dangerouslySetInnerHTML) {
      const html = dangerouslySetInnerHTML.__html;
      const total = splitHtml(html, Infinity).visible;

      // Nothing rendered here, so it can't host the caret.
      if (total === 0) return node;

      if (state.left > total) {
        state.left -= total;
        return node;
      }

      if (state.left <= 0) {
        const hidden = cloneElement(node, { style: { ...style, ...HIDDEN } });
        if (state.placed) return hidden;
        state.placed = true;
        return (
          <>
            {state.caret}
            {hidden}
          </>
        );
      }

      const { head, tail } = splitHtml(html, state.left);
      state.left = 0;
      state.placed = true;
      return (
        <>
          {cloneElement(node, { dangerouslySetInnerHTML: { __html: head } })}
          {state.caret}
          {tail.length > 0
            ? cloneElement(node, {
                style: { ...style, ...HIDDEN },
                dangerouslySetInnerHTML: { __html: tail },
              })
            : null}
        </>
      );
    }

    if (children !== undefined) {
      return cloneElement(node, undefined, revealRichText(children, state));
    }

    // Structural zero-width nodes (<br />) always render — they hold the line
    // layout that keeps the reveal from reflowing.
    return node;
  }

  return node;
}
