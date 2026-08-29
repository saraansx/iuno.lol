import React from "react";

const FORMAT_RULES: { regex: RegExp; render: (inner: React.ReactNode, key: number) => React.ReactNode }[] = [
  { regex: /^\*\*(.+?)\*\*/, render: (inner, key) => <strong key={key}>{inner}</strong> },
  { regex: /^__(.+?)__/, render: (inner, key) => <u key={key}>{inner}</u> },
  { regex: /^~~(.+?)~~/, render: (inner, key) => <s key={key}>{inner}</s> },
  { regex: /^~(.+?)~/, render: (inner, key) => <s key={key}>{inner}</s> },
  { regex: /^\*(.+?)\*/, render: (inner, key) => <em key={key}>{inner}</em> },
  { regex: /^_(.+?)_/, render: (inner, key) => <em key={key}>{inner}</em> },
];

export function parseInlineFormatting(text: string): React.ReactNode {
  if (!text) return null;

  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const emojiMatch = remaining.match(/^<(a)?:([a-zA-Z0-9_~]+):([0-9]+)>/);
    if (emojiMatch) {
      const isAnimated = Boolean(emojiMatch[1]);
      const name = emojiMatch[2];
      const id = emojiMatch[3];
      const ext = isAnimated ? "gif" : "png";
      const emojiUrl = `https://cdn.discordapp.com/emojis/${id}.${ext}?size=48&quality=lossless`;

      nodes.push(
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={key++}
          src={emojiUrl}
          alt={`:${name}:`}
          title={`:${name}:`}
          className="inline-block align-middle object-contain mx-0.5"
          style={{ height: "1.25em", width: "auto", maxHeight: "1.25em" }}
        />
      );
      remaining = remaining.slice(emojiMatch[0].length);
      continue;
    }

    let matched = false;
    for (const { regex, render } of FORMAT_RULES) {
      const match = remaining.match(regex);
      if (match) {
        nodes.push(render(parseInlineFormatting(match[1]), key++));
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      const nextIndex = remaining.search(/[<*~_]/);
      if (nextIndex === -1) {
        nodes.push(remaining);
        break;
      } else if (nextIndex === 0) {
        nodes.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        nodes.push(remaining.slice(0, nextIndex));
        remaining = remaining.slice(nextIndex);
      }
    }
  }

  return nodes.length === 1 ? nodes[0] : nodes;
}
