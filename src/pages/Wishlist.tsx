import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { fetchWishlist, removeWishlist } from "@/lib/app-queries";
import { Button } from "@/components/ui/button";
import { Loader2, Heart } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/format";

export function Wishlist() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Array<{ id: string; kos: any }>>([]);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchWishlist(user.id)
      .then(setItems)
      .catch((error) => toast.error(error.message || "Gagal memuat wishlist"));
  }, [user, refresh]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-background px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Akses Wishlist</h1>
        <p className="mt-2 text-muted-foreground">Silakan masuk terlebih dahulu untuk melihat dan mengelola wishlist kamu.</p>
        <Link to="/login">
          <Button className="mt-6 bg-gradient-cta">Masuk</Button>
        </Link>
      </div>
    );
  }

  const handleRemove = async (kosId: string) => {
    setBusy(kosId);
    try {
      await removeWishlist(user.id, kosId);
      setRefresh((value) => value + 1);
      toast.success("Item dihapus dari wishlist");
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus item");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wishlist Saya</h1>
          <p className="mt-2 text-sm text-muted-foreground">Semua kos yang kamu simpan akan tampil di sini.</p>
        </div>
        <div className="rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">{items.length} item tersimpan</div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">
          <Heart className="mx-auto mb-4 h-10 w-10 text-primary" />
          <p className="text-lg font-semibold text-foreground">Wishlist kamu masih kosong</p>
          <p className="mt-2">Jelajahi kos dan simpan yang kamu suka.</p>
          <Link to="/cari">
            <Button className="mt-6 bg-gradient-cta">Cari Kos</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <img src={item.kos.image || "/placeholder.svg"} alt={item.kos.name} className="h-32 w-full rounded-3xl object-cover sm:h-32 sm:w-44" />
                <div className="flex-1">
                  <Link to={`/kos/${item.kos.slug}`} className="text-xl font-semibold text-foreground hover:text-primary">{item.kos.name}</Link>
                  <p className="mt-2 text-sm text-muted-foreground">{item.kos.area}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatRupiah(item.kos.price)} / {item.kos.price_period || "bulan"}</span>
                    <span className="rounded-full bg-muted px-2 py-1">{item.kos.type}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link to={`/kos/${item.kos.slug}`}>
                  <Button variant="outline" size="sm">Lihat Kos</Button>
                </Link>
                <Button size="sm" variant="destructive" disabled={busy === item.kos.id} onClick={() => handleRemove(item.kos.id)}>
                  {busy === item.kos.id ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
