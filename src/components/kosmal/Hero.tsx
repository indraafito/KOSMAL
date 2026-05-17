import { Search, MapPin, ShieldCheck, BadgeDollarSign, MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroStudent from "@/assets/hero-student.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const kecamatans = ["Semua Kecamatan", "Lowokwaru", "Klojen", "Blimbing", "Sukun", "Kedungkandang"];

export function Hero() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [area, setArea] = useState("Semua Kecamatan");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (area !== "Semua Kecamatan") params.set("area", area);
    const query = params.toString();
    navigate(`/cari${query ? `?${query}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
      <div aria-hidden className="absolute inset-0 opacity-20" style={{
        backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0, transparent 40%)",
      }} />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-40">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" /> Marketplace Kos Terverifikasi #1 di Malang
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            Cari Kos di Malang,<br />
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Tanpa Drama!</span> <span className="inline-block animate-float-slow">??</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/85 md:text-lg">
            Semua info kos di Malang, langsung di KOSMAL. Foto asli, fasilitas jelas, harga transparan.
          </p>

          <div className="mt-8 rounded-2xl bg-card p-3 shadow-glow">
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Cari lokasi, nama kos, atau fasilitas..."
                  className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border px-3 md:w-56">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full bg-transparent py-3 text-sm text-foreground outline-none">
                  {kecamatans.map((k) => <option key={k}>{k}</option>)}
                </select>
              </div>
              <Button onClick={handleSearch} size="lg" className="rounded-xl bg-gradient-cta px-6 font-semibold shadow-soft hover:opacity-95">
                Cari Kos <Search className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { icon: ShieldCheck, label: "Data Terverifikasi" },
              { icon: BadgeDollarSign, label: "Harga Transparan" },
              { icon: MessageSquareHeart, label: "Review Jujur" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                <Icon className="h-3.5 w-3.5" /> {label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div aria-hidden className="absolute inset-0 -z-10 rounded-full bg-white/20 blur-3xl" />
          <img
            src={heroStudent}
            alt="Mahasiswa mencari kos di Malang dengan KOSMAL"
            width={1024}
            height={1024}
            className="relative mx-auto w-full max-w-sm animate-float-slow drop-shadow-2xl lg:max-w-md"
          />
        </div>
      </div>
    </section>
  );
}
