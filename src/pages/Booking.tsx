import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchTenantBookings } from "@/lib/app-queries";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/format";

export function Booking() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<Array<any>>([]);

  useEffect(() => {
    if (!user) return;
    fetchTenantBookings(user.id)
      .then(setBookings)
      .catch((error) => toast.error(error.message || "Gagal memuat booking"));
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-background px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Booking Saya</h1>
          <p className="mt-2 text-sm text-muted-foreground">Semua permintaan booking yang telah kamu kirim.</p>
        </div>
        <div className="rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">{bookings.length} permintaan</div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">
          <p className="text-lg font-semibold text-foreground">Belum ada booking</p>
          <p className="mt-2">Silakan pilih kos dan kirim permintaan booking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kos</p>
                  <p className="text-xl font-semibold text-foreground">{booking.kos?.name ?? booking.kos_id}</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground">{booking.status}</span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="mt-1 text-foreground">{new Date(booking.check_in).toLocaleDateString("id-ID")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durasi</p>
                  <p className="mt-1 text-foreground">{booking.duration_months} bulan</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Harga</p>
                  <p className="mt-1 text-foreground">{formatRupiah(booking.total_price)}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Catatan</p>
                <p className="mt-1 text-foreground">{booking.notes || "-"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
