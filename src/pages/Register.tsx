import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KosmalLogo } from "@/components/kosmal/Logo";
import { toast } from "sonner";
import { Loader2, User, Building2 } from "lucide-react";
import { PasswordInput } from "@/components/kosmal/PasswordInput";

export function Register() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState<"tenant" | "owner">(() => {
    return searchParams.get("role") === "owner" ? "owner" : "tenant";
  });

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
      // 1. Signup user (tanpa email verification flow)
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role,
          },
        },
      });

      if (signUpError) {
        toast.error(signUpError.message);
        return;
      }

      // 2. langsung login (karena email verification OFF)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        toast.error(signInError.message);
        return;
      }

      toast.success("Akun berhasil dibuat & login!");
      navigate("/");

    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-gradient-hero px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-glow">

        {/* LOGO */}
        <div className="mb-6 flex justify-center">
          <Link to="/">
            <KosmalLogo />
          </Link>
        </div>

        {/* TITLE */}
        <h1 className="text-center font-display text-2xl font-extrabold text-foreground">
          Daftar KOSMAL
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Gratis tanpa drama, mulai cari kos sekarang.
        </p>

        {/* ROLE SWITCH */}
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/50 p-1">
          {[
            { value: "tenant", icon: User, label: "Pencari Kos" },
            { value: "owner", icon: Building2, label: "Pemilik Kos" },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value as "tenant" | "owner")}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                role === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* FORM */}
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

        {/* LOGIN LINK */}
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