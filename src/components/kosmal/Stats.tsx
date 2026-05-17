import { Home, ShieldCheck, Users } from "lucide-react";

const stats = [
  { icon: Home, value: "500+", label: "Kos Terdaftar" },
  { icon: ShieldCheck, value: "200+", label: "Kos Terverifikasi" },
  { icon: Users, value: "2.000+", label: "Penyewa Puas" },
];

export function Stats() {
  return (
    <section className="mx-auto relative z-10 mt-8 max-w-6xl px-4 sm:px-6 lg:-mt-12 xl:-mt-16 lg:px-8">
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-card sm:grid-cols-3 sm:p-6">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-xl p-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-primary">
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

