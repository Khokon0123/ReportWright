export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 font-semibold tracking-tight ${className}`}>
      <span className="text-black">Report</span>
      <span className="text-accent">Wright</span>
    </span>
  );
}
