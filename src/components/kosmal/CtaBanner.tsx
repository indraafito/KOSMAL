import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 text-center text-primary-foreground shadow-glow sm:p-16">
        <div aria-hidden className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.4), transparent 35%), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.3), transparent 40%)",
        }} />
        <div className="relative">
          <Sparkles className="mx-auto h-8 w-8" />
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Temukan Kosmu Sekarang!</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Ratusan kos terverifikasi di Malang menunggu untuk kamu pilih. Mulai pencarianmu hari ini.
          </p>
          <Button size="lg" className="mt-7 rounded-xl bg-card px-7 font-bold text-primary hover:bg-card/95">
            Mulai Cari Kos <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}