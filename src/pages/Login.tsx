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

        <Button onClick={onGoogle} variant="outline" className="mt-6 w-full font-semibold">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.1 29.3 4 24 4C12.9 4 4 12.9 4 24s8.9 20 20 20s20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.1 29.3 4 24 4C16.3 4 9.6 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C41.3 35.7 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"/>
          </svg>
          Masuk dengan Google
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> ATAU <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" placeholder="kamu@email.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" placeholder="••••••••" />
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
