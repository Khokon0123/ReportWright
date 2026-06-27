import { ProtectedShell } from "@/components/ProtectedShell";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
