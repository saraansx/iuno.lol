import { profileFontVariables } from "@/lib/profile-fonts";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${profileFontVariables} contents`}>{children}</div>;
}
