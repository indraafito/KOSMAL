import { KosmalLogo } from "./Logo";
import { Instagram, Music2, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <KosmalLogo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Marketplace kos terverifikasi di Malang. Cari kos lebih mudah, transparan, dan tanpa drama.
            </p>
            <div className="mt-5 flex gap-2">
              {[Instagram, Music2, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" aria-label="social" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-brand-soft hover:text-primary">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-foreground">Navigasi</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Beranda</a></li>
              <li><a href="#" className="hover:text-primary">Cari Kos</a></li>
              <li><a href="#" className="hover:text-primary">Untuk Pemilik</a></li>
              <li><a href="#" className="hover:text-primary">Tentang Kami</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-foreground">Bantuan</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">FAQ</a></li>
              <li><a href="#" className="hover:text-primary">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-primary">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-primary">Hubungi Kami</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2025 KOSMAL — Kos Malang Lokal. All rights reserved.</p>
          <p>Dibuat dengan ❤️ untuk warga Malang.</p>
        </div>
      </div>
    </footer>
  );
}