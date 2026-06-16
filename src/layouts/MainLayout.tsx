// src/layouts/MainLayout.tsx

import { Outlet } from "react-router-dom";
import AnimatedBackground from "../components/AnimatedBackground";
import CursorParticleBackground from "../components/CursorParticleBackground";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className="site-shell">
      <AnimatedBackground />
      <CursorParticleBackground />

      <Navbar />

      <main className="site-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
