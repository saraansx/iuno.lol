import "server-only";
import net from "node:net";

try {
  (net as unknown as { setDefaultAutoSelectFamily?: (v: boolean) => void }).setDefaultAutoSelectFamily?.(true);
} catch {
}

export {};
