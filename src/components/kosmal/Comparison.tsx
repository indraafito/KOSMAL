import { Check, X, Camera, ListChecks, Wallet, Star, AlertTriangle, HelpCircle, Banknote, Frown } from "lucide-react";

const before = [
  { icon: AlertTriangle, text: "Foto tidak sesuai aslinya" },
  { icon: HelpCircle, text: "Fasilitas tidak jelas" },
  { icon: Banknote, text: "Harga tersembunyi, banyak biaya tambahan" },
  { icon: Frown, text: "Review tidak bisa dipercaya" },
];
const after = [
  { icon: Camera, text: "Foto & info sesuai keadaan asli" },
  { icon: ListChecks, text: "Fasilitas lengkap & jelas" },
  { icon: Wallet, text: "Harga transparan, tanpa biaya tersembunyi" },
  { icon: Star, text: "Review jujur dari penghuni kos" },
];

export function Comparison() {
  return (
    <section className="bg-brand-soft/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Kenapa KOSMAL?</span>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-foreground sm:text-3xl">Beda dengan platform kos lainnya</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-destructive/20 bg-card p-6 shadow-soft">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-destructive">
              <X className="h-3.5 w-3.5" /> Sebelum Verifikasi
            </div>
            <ul className="space-y-3">
              {before.map((b) => (
                <li key={b.text} className="flex items-start gap-3 text-sm text-muted-foreground line-through decoration-destructive/40">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <b.icon className="h-4 w-4" />
                  </span>
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative rounded-2xl border border-success/20 bg-card p-6 shadow-card">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-success">
              <Check className="h-3.5 w-3.5" /> Sesudah Verifikasi KOSMAL
            </div>
            <ul className="space-y-3">
              {after.map((b) => (
                <li key={b.text} className="flex items-start gap-3 text-sm font-medium text-foreground">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-success/15 text-success">
                    <b.icon className="h-4 w-4" />
                  </span>
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}