import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/kosmal/Navbar";
import { Footer } from "@/components/kosmal/Footer";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Search } from "@/pages/Search";
import { KosDetail } from "@/pages/KosDetail";
import { Profile } from "@/pages/Profile";
import { Dashboard } from "@/pages/Dashboard";
import { OwnerDashboard } from "@/pages/OwnerDashboard";
import { OwnerKos } from "@/pages/OwnerKos";
import { OwnerBooking } from "@/pages/OwnerBooking";
import { OwnerChat } from "@/pages/OwnerChat";
import { Wishlist } from "@/pages/Wishlist";
import { Booking } from "@/pages/Booking";
import { Chat } from "@/pages/Chat";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { NotFound } from "@/pages/NotFound";
import { RoleGuard } from "@/components/kosmal/RoleGuard";

export function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cari" element={<Search />} />
          <Route path="/kos/:slug" element={<KosDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wishlist" element={<RoleGuard allow={["tenant"]}><Wishlist /></RoleGuard>} />
          <Route path="/booking" element={<RoleGuard allow={["tenant"]}><Booking /></RoleGuard>} />
          <Route path="/chat" element={<RoleGuard allow={["tenant"]}><Chat /></RoleGuard>} />
          <Route path="/owner/dashboard" element={<RoleGuard allow={["owner"]}><OwnerDashboard /></RoleGuard>} />
          <Route path="/owner/kos" element={<RoleGuard allow={["owner"]}><OwnerKos /></RoleGuard>} />
          <Route path="/owner/booking" element={<RoleGuard allow={["owner"]}><OwnerBooking /></RoleGuard>} />
          <Route path="/owner/chat" element={<RoleGuard allow={["owner"]}><OwnerChat /></RoleGuard>} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
