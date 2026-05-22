import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Camera, User } from "lucide-react";

export function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [v, setV] = useState({
    full_name: "",
    phone: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (profile) {
      setV({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0 || !user) {
        throw new Error("Pilih gambar untuk diupload");
      }
      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("k0s-images").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("k0s-images").getPublicUrl(filePath);
      
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
      if (updateError) throw updateError;

      setV({ ...v, avatar_url: data.publicUrl });
      await refreshProfile();
      toast.success("Foto profil berhasil diupdate");
    } catch (error: any) {
      toast.error(error.message || "Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: v.full_name,
        phone: v.phone,
        bio: v.bio,
      }).eq("id", user.id);
      
      if (error) throw error;
      await refreshProfile();
      toast.success("Profil berhasil disimpan");
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan profil");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-display font-extrabold text-foreground">Profil Saya</h1>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="h-32 bg-gradient-hero"></div>
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="relative -mt-16 mb-8 flex justify-between items-end">
            <div className="relative group">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-muted text-4xl shadow-md">
                {v.avatar_url ? (
                  <img src={v.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Email <span className="text-muted-foreground font-normal">(Tidak bisa diubah)</span></Label>
              <Input value={user.email} disabled className="mt-1 bg-muted/50" />
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="full_name">Nama Lengkap</Label>
                <Input id="full_name" value={v.full_name} onChange={(e) => setV({...v, full_name: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phone">Nomor HP / WhatsApp</Label>
                <Input id="phone" value={v.phone} onChange={(e) => setV({...v, phone: e.target.value})} className="mt-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio Singkat</Label>
              <Textarea id="bio" value={v.bio} onChange={(e) => setV({...v, bio: e.target.value})} className="mt-1" placeholder="Ceritakan sedikit tentang dirimu" rows={4} />
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" disabled={loading} className="bg-gradient-cta">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
