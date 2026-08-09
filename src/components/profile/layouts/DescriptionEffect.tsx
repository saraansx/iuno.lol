"use client";

// No effects yet — "none" is the only option, so nothing is imported and
// nothing extra is downloaded. Add effects the same way UsernameEffect does:
// a dynamic() import per effect plus a branch below.

interface DescriptionEffectProps {
  effect?: string;
  children: React.ReactNode;
}

export function DescriptionEffect({ effect = "none", children }: DescriptionEffectProps) {
  if (!effect || effect === "none") {
    return <>{children}</>;
  }

  return <>{children}</>;
}
