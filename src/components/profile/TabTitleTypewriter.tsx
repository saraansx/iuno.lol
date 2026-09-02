"use client";

import { useEffect } from "react";

export default function TabTitleTypewriter({ text }: { text: string }) {
  useEffect(() => {
    const full = text.trim();
    if (!full) return;

    const original = document.title;
    let i = 0;
    let deleting = false;

    const tick = () => {
      document.title = full.slice(0, i) || "​";

      if (!deleting && i === full.length) {
        deleting = true;
        return 1200;
      }
      if (deleting && i === 0) {
        deleting = false;
        return 600;
      }

      i += deleting ? -1 : 1;
      return deleting ? 60 : 130;
    };

    let timer: ReturnType<typeof setTimeout>;
    const loop = () => {
      timer = setTimeout(loop, tick());
    };
    loop();

    return () => {
      clearTimeout(timer);
      document.title = original;
    };
  }, [text]);

  return null;
}
