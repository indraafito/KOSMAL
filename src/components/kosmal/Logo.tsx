import { Home, MapPin } from "lucide-react";

export function KosmalLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-cta shadow-soft">
        <Home className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        <MapPin className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-card p-0.5 text-primary" strokeWidth={3} />
      </div>
      <div className="leading-tight">
        <div className="font-display text-lg font-extrabold tracking-tight text-foreground">KOSMAL</div>
        <div className="-mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Kos Malang Lokal</div>
      </div>
    </div>
  );
}