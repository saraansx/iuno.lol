import type { ReactNode } from "react";

/**
 * Extract the plain string from a ReactNode tree. Used by text-transform
 * effects (shuffle, typewriter) which assume the username renders as a single
 * string (true for Layout1's <h1>).
 */
export function extractText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  // React element with a string child (e.g. Layout1's <h1>...</h1>)
  if (children && typeof children === "object" && "props" in children) {
    const props = (children as { props?: { children?: ReactNode } }).props;
    if (props?.children !== undefined) return extractText(props.children);
  }
  return "";
}
