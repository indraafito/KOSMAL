import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KosmalLogo } from "@/components/kosmal/Logo";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/kosmal/PasswordInput";

export function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-gradient-hero px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Email atau password salah" : error.message);
      return;
    }
    toast.success("Berhasil masuk");
    navigate("/");
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error("Gagal login dengan Google");
    else if (!result.redirected) navigate("/");
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-gradient-hero px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-glow">
        <div className="mb-6 flex justify-center">
          <Link to="/">
            <KosmalLogo />
          </Link>
        </div>
        <h1 className="text-center font-display text-2xl font-extrabold text-foreground">Masuk ke KOSMAL</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Selamat datang kembali, cari kos tanpa drama.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" placeholder="masukkan email kamu" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" placeholder="masukkan password kamu" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-cta font-semibold">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Masuk
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Belum punya akun? <Link to="/register" className="font-semibold text-primary hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}
