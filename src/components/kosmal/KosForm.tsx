import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

const FACS = ["wifi","ac","bath","parking","kitchen"];
const KECAMATAN = ["Lowokwaru","Klojen","Blimbing","Sukun","Kedungkandang"];
const TIPE = ["Putra","Putri","Campur"] as const;

export type KosFormValues = {
  name: string; area: string; address: string; type: typeof TIPE[number];
  description: string; price: number; available: number;
  facilities: string[]; all_facilities: string[]; rules: string[];
  image: string | null; gallery: string[];
};

type KosFormInitial = Partial<Omit<KosFormValues, "image">> & { image?: string | null };

export function KosForm({ initial, onSubmit }: { initial?: KosFormInitial; onSubmit: (v: KosFormValues) => Promise<unknown> }) {
  const { user } = useAuth();
  const [v, setV] = useState<KosFormValues>({
    name: initial?.name ?? "", area: initial?.area ?? KECAMATAN[0], address: initial?.address ?? "",
    type: (initial?.type as KosFormValues["type"]) ?? "Putra",
    description: initial?.description ?? "", price: initial?.price ?? 1000000, available: initial?.available ?? 1,
    facilities: initial?.facilities ?? [], all_facilities: initial?.all_facilities ?? [],
    rules: initial?.rules ?? [], image: initial?.image ?? "", gallery: initial?.gallery ?? [],
  });
  const [busy, setBusy] = useState(false); const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("kos-images").upload(path, file);
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data } = supabase.storage.from("kos-images").getPublicUrl(path);
    setV((s) => ({ ...s, gallery: [...s.gallery, data.publicUrl], image: s.image || data.publicUrl }));
    setUploading(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { await onSubmit(v); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
      <div><Label>Nama Kos</Label><Input required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className="mt-1" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Kecamatan</Label>
          <select value={v.area} onChange={(e) => setV({ ...v, area: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
            {KECAMATAN.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
        <div><Label>Tipe</Label>
          <select value={v.type} onChange={(e) => setV({ ...v, type: e.target.value as KosFormValues["type"] })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
            {TIPE.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
      </div>
      <div><Label>Alamat lengkap</Label><Input required value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} className="mt-1" /></div>
      <div><Label>Deskripsi</Label><Textarea required value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} className="mt-1" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Harga / bulan (Rp)</Label><Input type="number" required value={v.price} onChange={(e) => setV({ ...v, price: Number(e.target.value) })} className="mt-1" /></div>
        <div><Label>Kamar tersedia</Label><Input type="number" required value={v.available} onChange={(e) => setV({ ...v, available: Number(e.target.value) })} className="mt-1" /></div>
      </div>
      <div>
        <Label>Fasilitas (untuk filter)</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {FACS.map((f) => {
            const on = v.facilities.includes(f);
            return <button type="button" key={f} onClick={() => setV({ ...v, facilities: on ? v.facilities.filter((x) => x !== f) : [...v.facilities, f] })} className={`rounded-full px-3 py-1 text-xs font-semibold ${on ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{f.toUpperCase()}</button>;
          })}
        </div>
      </div>
      <div><Label>Fasilitas lengkap (1 baris per item)</Label>
        <Textarea value={v.all_facilities.join("\n")} onChange={(e) => setV({ ...v, all_facilities: e.target.value.split("\n").filter(Boolean) })} className="mt-1" rows={4} />
      </div>
      <div><Label>Peraturan (1 baris per item)</Label>
        <Textarea value={v.rules.join("\n")} onChange={(e) => setV({ ...v, rules: e.target.value.split("\n").filter(Boolean) })} className="mt-1" rows={3} />
      </div>
      <div>
        <Label>Foto Kos</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {v.gallery.map((g, i) => (
            <div key={i} className="relative h-20 w-28 overflow-hidden rounded-lg">
              <img src={g} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => setV({ ...v, gallery: v.gallery.filter((_, j) => j !== i), image: v.image === g ? (v.gallery.find((_, j) => j !== i) ?? "") : v.image })} className="absolute right-1 top-1 rounded-full bg-destructive p-0.5 text-white"><X className="h-3 w-3" /></button>
            </div>
          ))}
          <label className="flex h-20 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted text-xs text-muted-foreground">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
        </div>
      </div>
      <Button type="submit" disabled={busy} className="bg-gradient-cta">{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan</Button>
    </form>
  );
}