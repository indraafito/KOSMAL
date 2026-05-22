import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchKosReviews, fetchReviewStats, hasUserReviewed, submitReview, type ReviewWithProfile } from "@/lib/review-queries";
import { generateReviewSummary } from "@/lib/ai-summary";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Sparkles, User } from "lucide-react";
import { Link } from "react-router-dom";

type Props = { kosId: string };

export function ReviewSection({ kosId }: Props) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [stats, setStats] = useState({ count: 0, avg: 0 });
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [revs, st] = await Promise.all([
        fetchKosReviews(kosId),
        fetchReviewStats(kosId),
      ]);
      setReviews(revs);
      setStats(st);

      if (user) {
        const reviewed = await hasUserReviewed(kosId, user.id);
        setAlreadyReviewed(reviewed);
      }

      // Load AI summary
      if (st.count >= 3) {
        setLoadingSummary(true);
        const summary = await generateReviewSummary(kosId);
        setAiSummary(summary);
        setLoadingSummary(false);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [kosId, user]);

  const handleSubmit = async () => {
    if (!user) return;
    if (rating === 0) return toast.error("Pilih rating bintang");
    if (!text.trim()) return toast.error("Tulis ulasan kamu");

    setSubmitting(true);
    try {
      await submitReview(kosId, user.id, rating, text.trim());
      toast.success("Review berhasil dikirim!");
      setRating(0);
      setText("");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-display font-extrabold text-foreground">{stats.avg}</p>
            <StarRating value={Math.round(stats.avg)} readonly size="sm" />
            <p className="mt-1 text-xs text-muted-foreground">{stats.count} ulasan</p>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Rating & Ulasan</h2>
            <p className="text-sm text-muted-foreground">Dari pengguna yang pernah tinggal atau berkunjung</p>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {(aiSummary || loadingSummary) && (
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            Ringkasan AI
          </div>
          {loadingSummary ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Membuat ringkasan...
            </div>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-foreground">{aiSummary}</p>
          )}
        </div>
      )}

      {/* Review Form */}
      {user && !alreadyReviewed && (
        <div className="rounded-3xl border border-border bg-card p-6">
          <h3 className="text-base font-semibold text-foreground">Tulis Ulasan</h3>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Rating</p>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ceritakan pengalaman kamu tentang kos ini..."
              rows={3}
            />
            <Button onClick={handleSubmit} disabled={submitting} className="bg-gradient-cta">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Ulasan
            </Button>
          </div>
        </div>
      )}

      {!user && (
        <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="font-semibold text-primary hover:underline">Masuk</Link> untuk memberikan ulasan
          </p>
        </div>
      )}

      {alreadyReviewed && (
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-4 text-center text-sm text-primary">
          Kamu sudah memberikan ulasan untuk kos ini
        </div>
      )}

      {/* Review List */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-3xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {review.profiles?.full_name || "Pengguna"}
                    </p>
                    <StarRating value={review.rating} readonly size="sm" />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{review.text}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviews.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Belum ada ulasan untuk kos ini. Jadilah yang pertama!
        </div>
      )}
    </div>
  );
}
