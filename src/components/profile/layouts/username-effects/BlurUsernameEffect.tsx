"use client";

export default function BlurUsernameEffect({ children }: { children: React.ReactNode }) {
  return <span className="username-blur inline-block">{children}</span>;
}
