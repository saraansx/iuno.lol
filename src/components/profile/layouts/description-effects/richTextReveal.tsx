import { cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";

type ElementProps = {
  children?: ReactNode;
  style?: CSSProperties;
  dangerouslySetInnerHTML?: { __html: string };
};

const HIDDEN: CSSProperties = { opacity: 0 };

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
  left: number;
  caret: ReactNode;
  placed: boolean;
};

function hide(node: ReactNode): ReactNode {
  return <span style={HIDDEN}>{node}</span>;
}

export function revealRichText(node: ReactNode, state: RevealState): ReactNode {
  if (node === null || node === undefined || typeof node === "boolean") return node;

  if (typeof node === "string" || typeof node === "number") {
    const text = String(node);

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

    return node;
  }

  return node;
}
