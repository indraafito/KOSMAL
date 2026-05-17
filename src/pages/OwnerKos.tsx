import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchOwnerKos } from "@/lib/kos-queries";
import { createKosListing, deleteKosListing } from "@/lib/app-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function OwnerKos() {
  const { user, loading } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState(0);
  const [type, setType] = useState<"Putra" | "Putri" | "Campur">("Putra");
  const [description, setDescription] = useState("");
  const [facilities, setFacilities] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadListings = async () => {
    if (!user) return;
    const data = await fetchOwnerKos(user.id);
    setListings(data);
  };

  useEffect(() => {
    if (!user) return;
    loadListings().catch((error) => toast.error(error.message || "Gagal memuat daftar kos"));
  }, [user]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    if (!name || !area || !address || !price) {
      toast.error("Lengkapi semua kolom yang wajib");
      return;
    }

    setSaving(true);
    try {
      await createKosListing({
        owner_id: user.id,
        name,
        area,
        address,
        price,
        type,
        description,
        facilities: facilities.split(",").map((value) => value.trim()).filter(Boolean),
      });
      toast.success("Listing kos berhasil dibuat");
      setName("");
      setArea("");
      setAddress("");
      setPrice(0);
      setDescription("");
      setFacilities("");
      await loadListings();
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat listing kos");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (kosId: string) => {
    setRemovingId(kosId);
    try {
      await deleteKosListing(kosId);
      toast.success("Listing kos berhasil dihapus");
      setListings((current) => current.filter((item) => item.id !== kosId));
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus listing");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 rounded-3xl border border-border bg-card p-8 shadow-soft">
        <h1 className="text-3xl font-bold text-foreground">Kelola Kos</h1>
        <p className="mt-2 text-sm text-muted-foreground">Buat, simpan, dan kelola listing kos milikmu di sini.</p>
        <form onSubmit={handleCreate} className="mt-8 grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Nama Kos</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" placeholder="Contoh: Kos Nyaman" />
            </div>
            <div>
              <Label htmlFor="area">Area</Label>
              <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} className="mt-2" placeholder="Contoh: Bandung" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="address">Alamat</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-2" placeholder="Alamat lengkap" />
            </div>
            <div>
              <Label htmlFor="price">Harga / Bulan</Label>
              <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-2" placeholder="2000000" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="type">Tipe Kos</Label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value as any)} className="mt-2 w-full rounded-3xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="Putra">Putra</option>
                <option value="Putri">Putri</option>
                <option value="Campur">Campur</option>
              </select>
            </div>
            <div>
              <Label htmlFor="facilities">Fasilitas (pisahkan koma)</Label>
              <Input id="facilities" value={facilities} onChange={(e) => setFacilities(e.target.value)} className="mt-2" placeholder="wifi, ac, parkir" />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2" placeholder="Deskripsikan kos kamu" />
          </div>

          <Button type="submit" disabled={saving} className="w-full bg-gradient-cta">
            {saving ? "Menyimpan..." : "Buat Listing Baru"}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Daftar Kos Saya</h2>
        {loading ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">Memuat daftar kos...</div>
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">Belum ada kos yang kamu tambahkan.</div>
        ) : (
          <div className="grid gap-4">
            {listings.map((item) => (
              <div key={item.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.area} — {item.type}</p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground">{item.status}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Harga</p>
                    <p className="mt-1 font-medium text-foreground">Rp {item.price?.toLocaleString("id-ID")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Alamat</p>
                    <p className="mt-1 text-foreground">{item.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fasilitas</p>
                    <p className="mt-1 text-foreground">{(item.facilities ?? []).join(", ") || "-"}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="destructive" disabled={removingId === item.id} onClick={() => handleDelete(item.id)}>
                    {removingId === item.id ? "Menghapus..." : "Hapus"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
