import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchKosBySlug } from "@/lib/kos-queries";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/format";
import { buildWhatsAppUrl, buildKosContactMessage, buildKosBookingMessage } from "@/lib/whatsapp-utils";
import { ReviewSection } from "@/components/kosmal/ReviewSection";
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  ShieldCheck,
  Loader2,
  MessageCircle,
  CalendarCheck,
  User,
  Check,
  Heart,
  Star,
  ImageIcon,
  Wifi,
  Snowflake,
  Bath,
  Car,
  ChefHat,
  Bed,
} from "lucide-react";

const getFacilityConfig = (facility: string) => {
  const normalized = facility.toLowerCase();
  if (normalized.includes("wifi")) return { icon: Wifi, label: facility };
  if (normalized.includes("ac") || normalized.includes("pendingin")) return { icon: Snowflake, label: facility };
  if (normalized.includes("km dalam") || normalized.includes("kamar mandi dalam") || normalized.includes("km luar")) return { icon: Bath, label: facility };
  if (normalized.includes("parkir") || normalized.includes("motor") || normalized.includes("mobil")) return { icon: Car, label: facility };
  if (normalized.includes("dapur")) return { icon: ChefHat, label: facility };
  if (normalized.includes("kasur") || normalized.includes("tempat tidur") || normalized.includes("bed")) return { icon: Bed, label: facility };
  return { icon: ShieldCheck, label: facility };
};

export function KosDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [kos, setKos] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wished, setWished] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [liveRating, setLiveRating] = useState(0);
  const [liveReviewsCount, setLiveReviewsCount] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchKosBySlug(slug)
      .then((data) => {
        setKos(data);
        if (data) {
          setLiveRating(data.rating ? Number(data.rating) : 0);
          setLiveReviewsCount(data.reviews_count || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!kos || !user) return;
    supabase.from("wishlist").select("id").eq("tenant_id", user.id).eq("kos_id", kos.id).maybeSingle()
      .then(
        ({ data }) => setWished(!!data),
        () => setWished(false)
      );
  }, [kos, user]);

  const toggleWishlist = async () => {
    if (!user) return navigate("/login");
    if (!hasRole("user")) return toast.error("Hanya user bisa wishlist");
    if (!kos) return;

    if (wished) {
      await supabase.from("wishlist").delete().eq("tenant_id", user.id).eq("kos_id", kos.id);
      setWished(false);
      toast.success("Dihapus dari wishlist");
    } else {
      await supabase.from("wishlist").insert({ tenant_id: user.id, kos_id: kos.id });
      setWished(true);
      toast.success("Disimpan ke wishlist");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-background px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!kos) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-muted-foreground sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">Kos tidak ditemukan</h1>
        <p className="mt-3">Silakan kembali ke halaman pencarian.</p>
        <Link to="/cari" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Cari Kos
        </Link>
      </div>
    );
  }

  const photos = kos.gallery?.length ? kos.gallery : (kos.photos?.length ? kos.photos : [kos.image || "/placeholder.svg"]);
  const contactMsg = buildKosContactMessage(kos.name, kos.area);
  const bookingMsg = buildKosBookingMessage(kos.name, kos.area);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide uppercase text-muted-foreground/80">
        <Link to="/" className="transition-colors hover:text-primary">Beranda</Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
        <Link to="/cari" className="transition-colors hover:text-primary">Cari Kos</Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
        <span className="font-semibold text-foreground truncate max-w-[200px]">{kos.name}</span>
      </div>

      {/* Title & Info Section (Above the Photo) */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {kos.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-success">
              <ShieldCheck className="h-3.5 w-3.5" /> Terverifikasi
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary border border-primary/20">
            {kos.type}
          </span>
          {kos.available !== undefined && (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              kos.available <= 2 
                ? "bg-destructive/10 text-destructive border border-destructive/20 animate-pulse" 
                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
            }`}>
              Sisa {kos.available} Kamar
            </span>
          )}
        </div>
        
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-none">
          {kos.name}
        </h1>
        
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{kos.area}, Malang</span>
          </div>
          <span className="text-muted-foreground/30">•</span>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{liveRating ? Number(liveRating).toFixed(1) : "0.0"} ({liveReviewsCount} ulasan)</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        
        {/* Left Column: Unified Photo & Info Card */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-soft h-fit">
          
          {/* Photo Gallery (Seamlessly integrated at the top of the card) */}
          <div className="relative aspect-[16/8] w-full overflow-hidden bg-muted group border-b border-border/80">
            <img 
              src={photos[activePhoto]} 
              alt={kos.name} 
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]" 
            />
            
            {photos.length > 1 && (
              <>
                {/* Left Navigation Button */}
                <button
                  onClick={() => setActivePhoto((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-sm transition shadow-soft z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Right Navigation Button */}
                <button
                  onClick={() => setActivePhoto((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-sm transition shadow-soft z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {photos.length > 1 && (
              <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md flex items-center gap-1 shadow-soft z-10">
                <ImageIcon className="h-3.5 w-3.5" /> {activePhoto + 1} / {photos.length}
              </div>
            )}
            {/* Photo navigation inside the gallery */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {photos.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhoto(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activePhoto ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Unified Content Information below the Photo */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Tentang Section */}
            <div>
              <h2 className="mb-3 font-display text-xs font-bold uppercase tracking-wider text-primary">Tentang Kos</h2>
              <p className="leading-relaxed text-muted-foreground whitespace-pre-line text-[15px]">
                {kos.description}
              </p>
            </div>

            {kos.all_facilities && kos.all_facilities.length > 0 && (
              <>
                <hr className="border-border/60" />
                {/* Fasilitas Section */}
                <div>
                  <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-wider text-primary">Fasilitas</h2>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {kos.all_facilities.map((facility: string) => {
                      const config = getFacilityConfig(facility);
                      const Icon = config.icon;
                      return (
                        <li 
                          key={facility} 
                          className="flex items-center gap-2.5 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold text-foreground/80 transition hover:border-primary/10 hover:bg-brand-soft/10"
                        >
                          <Icon className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate uppercase">{facility}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            )}

            <hr className="border-border/60" />

            {/* Alamat Lengkap Section */}
            <div>
              <h2 className="mb-3 flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-primary">
                <MapPin className="h-4 w-4 text-primary" /> Alamat Lengkap
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{kos.address}</p>
            </div>

            <hr className="border-border/60" />

            {/* Review Section */}
            <ReviewSection 
              kosId={kos.id} 
              onStatsLoaded={(st) => {
                setLiveRating(st.avg);
                setLiveReviewsCount(st.count);
              }}
            />
          </div>
        </div>

        {/* Right Column: Sticky Sidebar (Booking Card) */}
        <div>
          {/* Booking Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sticky top-24 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Harga Sewa</p>
              <div className="mt-2 flex items-baseline gap-1 text-primary whitespace-nowrap overflow-hidden">
                {kos.price_type === "range" && kos.price_max ? (
                  <>
                    <span className="font-display text-sm sm:text-base lg:text-lg font-extrabold tracking-tight">{formatRupiah(kos.price)}</span>
                    <span className="text-xs font-medium text-muted-foreground/60 mx-0.5">s/d</span>
                    <span className="font-display text-sm sm:text-base lg:text-lg font-extrabold tracking-tight">{formatRupiah(Number(kos.price_max))}</span>
                  </>
                ) : (
                  <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">{formatRupiah(kos.price)}</span>
                )}
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground ml-1">/ {kos.price_period || "bulan"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={toggleWishlist} 
                variant="outline" 
                className={`w-full rounded-full py-6 font-bold shadow-soft flex items-center justify-center gap-2 border-primary/20 transition duration-300 ${
                  wished 
                    ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20" 
                    : "hover:bg-brand-soft/20 text-primary"
                }`}
              >
                <Heart className={`h-4.5 w-4.5 ${wished ? "fill-current" : ""}`} />
                {wished ? "Tersimpan di Wishlist" : "Simpan Ke Wishlist"}
              </Button>
            </div>

            <hr className="border-border/60" />

            <div className="space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Info Pemilik
              </h3>
              
              <div className="flex items-center gap-3 rounded-2xl bg-muted/30 p-3 border border-border/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground leading-snug">{kos.owner_name}</p>
                  <p className="text-xs text-muted-foreground">Pemilik Kos Terdaftar</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <a 
                  href={buildWhatsAppUrl(kos.owner_whatsapp, bookingMsg)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-cta px-4 py-3 text-sm font-bold text-white shadow-soft transition duration-300 hover:scale-[1.01] hover:shadow-card"
                >
                  <CalendarCheck className="h-4.5 w-4.5" /> Pesan Sekarang
                </a>
                <a 
                  href={buildWhatsAppUrl(kos.owner_whatsapp, contactMsg)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-bold text-primary transition duration-300 hover:bg-primary/10 hover:border-primary/40 shadow-soft"
                >
                  <MessageCircle className="h-4.5 w-4.5" /> Tanya Pemilik
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}