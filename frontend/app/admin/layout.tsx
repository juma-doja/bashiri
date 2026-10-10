"use client";
import "./admin.css";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/stores/admin-auth.store";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { Menu, Search, ShieldCheck } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { access } = useAdminAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !access && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, pathname, isHydrated]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  if (pathname === "/admin/login") {
    return <div className="min-h-dvh bg-background">{children}</div>;
  }

  if (!isHydrated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!access) return null;

  return (
    <div className="min-h-dvh bg-[#080d0b] text-white">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-dvh md:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#080d0b]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin navigation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/65 transition hover:bg-white/[0.08] md:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#79e5b8]">Bashiri operations</p>
              <h1 className="mt-0.5 truncate text-sm font-bold text-white sm:text-base">Administration workspace</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-white/35 lg:flex">
              <Search size={14} />
              <span>Operations console</span>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#61d7a5]/20 bg-[#61d7a5]/[0.08] text-[#79e5b8]">
              <ShieldCheck size={17} />
            </span>
          </div>
        </header>
        <main className="admin-page-content mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-9">{children}</main>
      </div>
    </div>
  );
}
