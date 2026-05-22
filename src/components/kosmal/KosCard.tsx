import { Heart, MapPin, Star, ShieldCheck, Wifi, Snowflake, Bath, Car, ChefHat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { KosCardData } from "@/lib/kos-queries";

const facilityMap: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi: { icon: Wifi, label: "WiFi" },
  ac: { icon: Snowflake, label: "AC" },
  bath: { icon: Bath, label: "KM Dalam" },
  parking: { icon: Car, label: "Parkir" },
  kitchen: { icon: ChefHat, label: "Dapur" },
};

const typeStyles: Record<string, string> = {
  Putra: "bg-blue-100 text-blue-700",
  Putri: "bg-pink-100 text-pink-700",
  Campur: "bg-violet-100 text-violet-700",
};

const formatRupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

export function KosCard({ kos }: { kos: KosCardData }) {
  const { user, hasRole } = useAuth();
  const [wished, setWished] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("wishlist").select("id").eq("tenant_id", user.id).eq("kos_id", kos.id).maybeSingle().then(({ data }) => setWished(!!data));
  }, [user, kos.id]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error("Masuk dulu untuk menyimpan");
    if (!hasRole("user")) return toast.error("Hanya pengguna biasa yang bisa wishlist");
    setBusy(true);
    if (wished) {
      await supabase.from("wishlist").delete().eq("tenant_id", user.id).eq("kos_id", kos.id);
      setWished(false);
      toast.success("Dihapus dari wishlist");
    } else {
      await supabase.from("wishlist").insert({ tenant_id: user.id, kos_id: kos.id });
      setWished(true);
      toast.success("Disimpan ke wishlist");
    }
    setBusy(false);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img src={kos.image} alt={kos.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {kos.verified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-success px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-success-foreground shadow-soft">
            <ShieldCheck className="h-3 w-3" /> Terverifikasi
          </span>
        )}
        <span
          className={`absolute right-3 top-3 rounded-md px-2 py-1 text-[10px] font-bold backdrop-blur ${typeStyles[kos.type] || "bg-muted text-foreground"
            }`}
        >
          {kos.type}
        </span>
        <button onClick={toggle} disabled={busy} aria-label="wishlist" className="absolute bottom-3 right-3 rounded-full bg-card/95 p-2 shadow-soft transition-colors hover:bg-card">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${wished ? "fill-destructive text-destructive" : "text-foreground"}`} />}
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-snug text-foreground">{kos.name}</h3>
          <div className="flex shrink-0 items-center gap-1 rounded-md bg-brand-soft px-1.5 py-0.5 text-xs font-semibold text-primary">
            <Star className="h-3 w-3 fill-current" /> {kos.rating ? Number(kos.rating).toFixed(1) : "0.0"}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {kos.area}, Malang &bull; <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" /> {kos.rating ? Number(kos.rating).toFixed(1) : "0.0"} ({kos.reviews} ulasan)
        </div>

        <div className="mt-3 flex items-end gap-1">
          <div className="font-display text-primary leading-none">
            {kos.price_type === "range" && kos.price_max ? (
              <span className="text-base font-extrabold tracking-tight">
                {formatRupiah(kos.price)} - {formatRupiah(kos.price_max)}
              </span>
            ) : (
              <span className="text-lg font-extrabold">
                {formatRupiah(kos.price)}
              </span>
            )}
          </div>

          <span className="text-xs text-muted-foreground mb-[2px]">
            / {kos.price_period}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {kos.facilities.slice(0, 4).map((f) => {
            const F = facilityMap[f] || { icon: ShieldCheck, label: f };
            return (
              <span key={f} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                <F.icon className="h-3 w-3" /> {F.label}
              </span>
            );
          })}
        </div>

        <Button asChild size="sm" variant="outline" className="mt-4 w-full border-primary/20 font-semibold text-primary hover:bg-brand-soft hover:text-primary">
          <Link to={`/kos/${encodeURIComponent(kos.slug ?? kos.id)}`}>Lihat Detail</Link>
        </Button>
      </div>
    </article>
  );
}
