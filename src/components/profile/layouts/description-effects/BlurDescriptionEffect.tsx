"use client";

import { cloneElement, isValidElement, type ReactNode } from "react";

type WithClassName = { className?: string };

export default function BlurDescriptionEffect({ children }: { children: ReactNode }) {
  if (isValidElement<WithClassName>(children)) {
    return cloneElement(children, {
      className: `${children.props.className ?? ""} description-blur`.trim(),
    });
  }

  return <span className="description-blur inline-block">{children}</span>;
}
