import { useEffect, useState } from "react";
import { fetchAllReviews, updateReviewStatus, deleteReview } from "@/lib/app-queries";
import { generateReviewSummary } from "@/lib/ai-summary";
import { Loader2, EyeOff, Eye, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/kosmal/StarRating";

export function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllReviews();
      setReviews(data);
    } catch (err) {
      toast.error("Gagal memuat ulasan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (id: string, current: string) => {
    const newStatus = current === "visible" ? "hidden" : "visible";
    try {
      await updateReviewStatus(id, newStatus as any);
      toast.success(`Ulasan berhasil disembunyikan/ditampilkan`);
      loadData();
    } catch (err: any) {
      toast.error("Gagal ubah status: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus ulasan ini permanen?")) {
      try {
        await deleteReview(id);
        toast.success("Ulasan berhasil dihapus");
        loadData();
      } catch (err: any) {
        toast.error("Gagal hapus ulasan");
      }
    }
  };

  const triggerAiSummary = async (kosId: string) => {
    setGeneratingFor(kosId);
    try {
      const summary = await generateReviewSummary(kosId);
      if (summary) toast.success("AI Summary berhasil diperbarui");
      else toast.info("Tidak ada perubahan AI summary");
    } catch (err) {
      toast.error("Gagal generate AI summary");
    } finally {
      setGeneratingFor(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-display font-extrabold text-foreground">Kelola Ulasan</h1>
      
      <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Pengguna</th>
                <th className="px-6 py-4 font-semibold">Kos</th>
                <th className="px-6 py-4 font-semibold w-1/3">Ulasan</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reviews.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground">{r.profiles?.full_name || "Tanpa Nama"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-primary">
                    <a href={`/kos/${r.kos?.slug}`} target="_blank" className="hover:underline">{r.kos?.name}</a>
                  </td>
                  <td className="px-6 py-4">
                    <div className="mb-1"><StarRating value={r.rating} readonly size="sm" /></div>
                    <p className="text-muted-foreground line-clamp-3">{r.text}</p>
                  </td>
                  <td className="px-6 py-4">
                    {r.status === "visible" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success"><Eye className="h-3 w-3" /> Terlihat</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"><EyeOff className="h-3 w-3" /> Disembunyikan</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 flex-wrap max-w-[200px] ml-auto">
                      <Button variant="outline" size="sm" onClick={() => triggerAiSummary(r.kos_id)} disabled={generatingFor === r.kos_id}>
                        {generatingFor === r.kos_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleToggleStatus(r.id, r.status)}>
                        {r.status === "visible" ? "Sembunyikan" : "Tampilkan"}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(r.id)} className="border-destructive text-destructive hover:bg-destructive hover:text-white">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Belum ada ulasan terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
