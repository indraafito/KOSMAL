import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/kosmal/Navbar";
import { Footer } from "@/components/kosmal/Footer";
import { ScrollToTop } from "@/components/kosmal/ScrollToTop";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Search } from "@/pages/Search";
import { KosDetail } from "@/pages/KosDetail";
import { Profile } from "@/pages/Profile";
import { Wishlist } from "@/pages/Wishlist";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { AdminKos } from "@/pages/AdminKos";
import { AdminUsers } from "@/pages/AdminUsers";
import { AdminReviews } from "@/pages/AdminReviews";
import { NotFound } from "@/pages/NotFound";
import { RoleGuard } from "@/components/kosmal/RoleGuard";

export function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          {/* Public routes (Guest + User + Admin) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cari" element={<Search />} />
          <Route path="/kos/:slug" element={<KosDetail />} />

          {/* User routes */}
          <Route path="/profile" element={<RoleGuard allow={["user", "admin"]}><Profile /></RoleGuard>} />
          <Route path="/wishlist" element={<RoleGuard allow={["user"]}><Wishlist /></RoleGuard>} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<RoleGuard allow={["admin"]}><AdminDashboard /></RoleGuard>} />
          <Route path="/admin/kos" element={<RoleGuard allow={["admin"]}><AdminKos /></RoleGuard>} />
          <Route path="/admin/users" element={<RoleGuard allow={["admin"]}><AdminUsers /></RoleGuard>} />
          <Route path="/admin/reviews" element={<RoleGuard allow={["admin"]}><AdminReviews /></RoleGuard>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
