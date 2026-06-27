import { ProtectedShell } from "@/components/ProtectedShell";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
