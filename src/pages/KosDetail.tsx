import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchKosBySlug } from "@/lib/kos-queries";
import { createBooking, findOrCreateConversation } from "@/lib/app-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/format";
import { ChevronRight, MapPin, Star, ShieldCheck, Loader2 } from "lucide-react";

export function KosDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [kos, setKos] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wished, setWished] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchKosBySlug(slug)
      .then((data) => setKos(data))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!kos || !user) return;
    supabase.from("wishlist").select("id").eq("tenant_id", user.id).eq("kos_id", kos.id).maybeSingle()
      .then(({ data }) => setWished(!!data))
      .catch(() => setWished(false));
  }, [kos, user]);

  const toggleWishlist = async () => {
    if (!user) return navigate("/login");
    if (!hasRole("tenant")) return toast.error("Hanya pencari kos bisa wishlist");
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

  const handleCreateConversation = async () => {
    if (!user) return navigate("/login");
    if (!hasRole("tenant")) return toast.error("Hanya pencari kos bisa menghubungi pemilik");
    if (!kos) return;

    setConversationLoading(true);
    try {
      const conversation = await findOrCreateConversation(user.id, kos.owner_id, kos.id);
      navigate(`/chat?conversationId=${conversation.id}`);
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat percakapan");
    } finally {
      setConversationLoading(false);
    }
  };

  const handleBookKos = async () => {
    if (!user) return navigate("/login");
    if (!hasRole("tenant")) return toast.error("Hanya pencari kos bisa melakukan booking");
    if (!kos) return;
    if (!checkIn) return toast.error("Pilih tanggal check-in");

    setBookingLoading(true);
    try {
      const totalPrice = kos.price * duration;
      await createBooking({
        tenant_id: user.id,
        owner_id: kos.owner_id,
        kos_id: kos.id,
        check_in: checkIn,
        duration_months: duration,
        total_price: totalPrice,
        notes,
      });
      toast.success("Permintaan booking berhasil dikirim");
      navigate("/booking");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengirim permintaan booking");
    } finally {
      setBookingLoading(false);
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
        <Link to="/cari" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Cari Kos</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Beranda</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/cari" className="hover:text-primary">Cari Kos</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-foreground">{kos.name}</span>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <img src={kos.image || "/placeholder.svg"} alt={kos.name} className="mb-6 h-[420px] w-full rounded-3xl object-cover" />
            <div className="flex flex-wrap items-center gap-2">
              {kos.verified && <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success"><ShieldCheck className="h-3 w-3" /> Terverifikasi</span>}
              <div className="inline-flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {kos.area}</div>
            </div>
            <h1 className="mt-4 text-3xl font-display font-extrabold text-foreground">{kos.name}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{kos.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground">Harga</h2>
              <div className="mt-3 text-3xl font-display font-extrabold text-primary">{formatRupiah(kos.price)}</div>
              <p className="mt-1 text-sm text-muted-foreground">/ bulan</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground">Rating</h2>
              <div className="mt-3 inline-flex items-center gap-2 text-lg font-semibold text-foreground"><Star className="h-5 w-5 text-yellow-400" /> {kos.rating}</div>
              <p className="mt-1 text-sm text-muted-foreground">{kos.reviews} review</p>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground">Fasilitas</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {(kos.all_facilities ?? []).map((facility: string) => (
                <div key={facility} className="rounded-2xl border border-border bg-background px-3 py-2">{facility}</div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Harga</p>
                <p className="mt-2 text-3xl font-display font-extrabold text-primary">{formatRupiah(kos.price)}</p>
              </div>
              <div className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-primary">{kos.type}</div>
            </div>
            <div className="mt-5 space-y-3">
              <Button onClick={toggleWishlist} className="w-full bg-gradient-cta">{wished ? "Disimpan" : "Simpan ke Wishlist"}</Button>
              <Button variant="outline" onClick={handleCreateConversation} className="w-full font-semibold">{conversationLoading ? "Membuat percakapan..." : "Chat Pemilik"}</Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Booking Kos</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="check-in">Check-in</Label>
                <Input id="check-in" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="duration">Durasi (bulan)</Label>
                <select id="duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-2 w-full rounded-3xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  {[...Array(12)].map((_, index) => (
                    <option key={index} value={index + 1}>{index + 1} bulan</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="notes">Catatan</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2" placeholder="Tulis catatan untuk pemilik" />
              </div>
              <Button disabled={bookingLoading} className="w-full bg-primary text-primary-foreground" onClick={handleBookKos}>
                {bookingLoading ? "Mengirim..." : "Kirim Permintaan Booking"}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <Label>Alamat</Label>
            <p className="mt-2 text-sm text-muted-foreground">{kos.address}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
