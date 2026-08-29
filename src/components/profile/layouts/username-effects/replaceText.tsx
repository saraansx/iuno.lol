import { cloneElement, isValidElement, type ReactNode } from "react";

type WithChildren = { children?: ReactNode };

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
