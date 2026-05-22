import { useEffect, useState } from "react";
import { deleteKosListing, createKosListing, updateKosListing } from "@/lib/app-queries";
import { fetchAllKos } from "@/lib/kos-queries";
import { Loader2, Plus, Edit, Trash2, ShieldCheck, ShieldAlert, FileWarning } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { KosForm, type KosFormValues } from "@/components/kosmal/KosForm";
import { useAuth } from "@/hooks/useAuth";

export function AdminKos() {
  const { user } = useAuth();
  const [kosList, setKosList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllKos();
      setKosList(data);
    } catch (err) {
      toast.error("Gagal memuat data kos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Apakah anda yakin menghapus kos ini secara permanen?")) {
      try {
        await deleteKosListing(id);
        toast.success("Kos berhasil dihapus");
        loadData();
      } catch (err: any) {
        toast.error("Gagal menghapus kos: " + err.message);
      }
    }
  };

  const handleToggleStatus = async (id: string, current: string) => {
    const newStatus = current === "approved" ? "rejected" : "approved";
    try {
      await updateKosListing(id, { status: newStatus as any });
      toast.success(`Status diubah menjadi ${newStatus}`);
      loadData();
    } catch (err: any) {
      toast.error("Gagal ubah status: " + err.message);
    }
  };

  const handleSubmitForm = async (v: KosFormValues) => {
    if (!user) return;
    try {
      if (isNew) {
        await createKosListing({
          ...v,
          owner_id: user.id, // Admin id is the owner
          photos: v.gallery,
        });
        toast.success("Kos berhasil ditambahkan");
      } else if (editing) {
        await updateKosListing(editing.id, {
          name: v.name, area: v.area, address: v.address, type: v.type as any,
          description: v.description, price: v.price, available: v.available,
          price_period: v.price_period, price_type: v.price_type, price_max: v.price_max,
          facilities: v.facilities, all_facilities: v.all_facilities, rules: v.rules,
          gallery: v.gallery, photos: v.gallery, image: v.gallery[0] || null,
          owner_name: v.owner_name, owner_whatsapp: v.owner_whatsapp,
        });
        toast.success("Kos berhasil diupdate");
      }
      setIsNew(false);
      setEditing(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading && !isNew && !editing) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isNew || editing) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-display font-extrabold text-foreground">{isNew ? "Tambah Kos" : "Edit Kos"}</h1>
          <Button variant="outline" onClick={() => { setIsNew(false); setEditing(null); }}>Batal</Button>
        </div>
        <KosForm 
          initial={editing ? {
            ...editing,
            price_period: editing.price_period || "bulan",
            price_type: editing.price_type || "fixed",
          } : undefined} 
          onSubmit={handleSubmitForm} 
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-display font-extrabold text-foreground">Kelola Kos</h1>
        <Button onClick={() => setIsNew(true)} className="bg-gradient-cta"><Plus className="mr-2 h-4 w-4" /> Tambah Kos</Button>
      </div>
      
      <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Kos</th>
                <th className="px-6 py-4 font-semibold">Harga</th>
                <th className="px-6 py-4 font-semibold">Pemilik</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {kosList.map((k) => (
                <tr key={k.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 overflow-hidden rounded-lg bg-muted">
                        <img src={k.image || k.photos?.[0] || "/placeholder.svg"} alt="" className="h-full w-full object-cover"/>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{k.name}</p>
                        <p className="text-xs text-muted-foreground">{k.area} • {k.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium">
                    Rp{k.price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{k.owner_name}</p>
                    <p className="text-xs text-muted-foreground">{k.owner_whatsapp}</p>
                  </td>
                  <td className="px-6 py-4">
                    {k.status === "approved" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success"><ShieldCheck className="h-3 w-3" /> Approved</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive"><FileWarning className="h-3 w-3" /> {k.status}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleToggleStatus(k.id, k.status)}>
                        {k.status === "approved" ? "Sembunyikan" : "Approve"}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setEditing(k)}>
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(k.id)} className="border-destructive text-destructive hover:bg-destructive hover:text-white">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {kosList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Belum ada kos terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
