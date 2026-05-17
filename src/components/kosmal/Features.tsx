import { ShieldCheck, BadgeDollarSign, Star } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Data Terverifikasi", desc: "Tim KOSMAL cek langsung setiap detail kos sebelum dipublikasikan." },
  { icon: BadgeDollarSign, title: "Harga Transparan", desc: "Harga jelas sejak awal — tanpa biaya tersembunyi di belakang hari." },
  { icon: Star, title: "Review Jujur", desc: "Dari penghuni asli kos, untuk membantu keputusan terbaikmu." },
];

export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">3 Keunggulan Kami</span>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-foreground sm:text-3xl">Dibangun untuk pencari kos modern</h2>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cta text-primary-foreground shadow-soft transition-transform group-hover:scale-110">
              <it.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-lg font-bold text-foreground">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}