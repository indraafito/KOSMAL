import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KosmalLogo } from "@/components/kosmal/Logo";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/kosmal/PasswordInput";

export function Register() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
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

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role: "user",
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered") || signUpError.message.includes("already been registered")) {
          toast.error("Email ini sudah terdaftar. Silakan login.");
          navigate("/login");
          return;
        }
        if (signUpError.message.includes("rate limit") || signUpError.status === 429) {
          toast.error("Terlalu banyak percobaan. Coba lagi dalam beberapa menit.");
          return;
        }
        if (signUpError.message.includes("weak password")) {
          toast.error("Password terlalu lemah. Gunakan kombinasi huruf dan angka.");
          return;
        }
        toast.error(signUpError.message);
        return;
      }

      // Auto-login after register
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        toast.error("Akun dibuat tapi gagal login otomatis. Silakan login manual.");
        navigate("/login");
        return;
      }

      toast.success("Akun berhasil dibuat & login!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan tak terduga");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-gradient-hero px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-glow">
        <div className="mb-6 flex justify-center">
          <Link to="/">
            <KosmalLogo />
          </Link>
        </div>

        <h1 className="text-center font-display text-2xl font-extrabold text-foreground">
          Daftar KOSMAL
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Gratis tanpa drama, mulai cari kos sekarang.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1"
              placeholder="Nama lengkap kamu"
            />
          </div>

          <div>
            <Label htmlFor="phone">Nomor HP</Label>
            <Input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1"
              placeholder="081234567890"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              placeholder="kamu@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-cta font-semibold"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Daftar Sekarang
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Masuk sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}