import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">Halaman tidak ditemukan.</p>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Kembali ke beranda</Link>
    </div>
  );
}
