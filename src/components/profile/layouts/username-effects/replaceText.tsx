import { cloneElement, isValidElement, type ReactNode } from "react";

type WithChildren = { children?: ReactNode };

/**
 * Render `children` with its text swapped for `text`, preserving the element's
 * own styling and classes. Text-transform effects (shuffle, typewriter) use
 * this so the username keeps its font size/weight/color and layout
 * (`max-w-[200px] truncate`, alignment, margins) instead of being replaced by
 * a bare, unstyled string that shrinks or resizes the card.
 *
 * If `children` is a single element, it is cloned with the new text plus an
 * optional trailing node (e.g. the typewriter caret). Otherwise a fragment
 * is used as a fallback.
 */
export function replaceText(children: ReactNode, text: string, trailing?: ReactNode): ReactNode {
  if (isValidElement<WithChildren>(children)) {
    return cloneElement(children, undefined, text, trailing);
  }
  return (
    <>
      {text}
      {trailing}
    </>
  );
}
