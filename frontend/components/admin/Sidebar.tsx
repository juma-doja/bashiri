"use client";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Calendar, CreditCard, Bell, Brain, LogOut, Flame, MessageSquare, ShieldAlert, Ticket, X, Image as ImageIcon, Star, Activity, type LucideIcon } from "lucide-react";
import { useAdminAuthStore } from "@/stores/admin-auth.store";
import { useEffect } from "react";

const NAV_GROUPS: { label: string; items: { href: string; icon: LucideIcon; label: string }[] }[] = [
  { label: "Workspace", items: [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/visitors", icon: Activity, label: "Traffic" },
  ] },
  { label: "Manage", items: [
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/matches", icon: Calendar, label: "Matches" },
    { href: "/admin/transactions", icon: CreditCard, label: "Transactions" },
    { href: "/admin/support", icon: Ticket, label: "Support" },
  ] },
  { label: "Content", items: [
    { href: "/admin/moderation", icon: ShieldAlert, label: "Moderation" },
    { href: "/admin/reviews", icon: Star, label: "Reviews" },
    { href: "/admin/debates", icon: MessageSquare, label: "Debates" },
    { href: "/admin/derbies", icon: Flame, label: "Derby mode" },
    { href: "/admin/hero-slides", icon: ImageIcon, label: "Hero slides" },
    { href: "/admin/hero-images", icon: ImageIcon, label: "Hero images" },
    { href: "/admin/notifications", icon: Bell, label: "Notifications" },
  ] },
  { label: "System", items: [
    { href: "/admin/ml-status", icon: Brain, label: "ML model" },
  ] },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAdminAuthStore();

  const handleNavClick = (href: string) => {
    router.push(href);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-[60] flex h-dvh flex-col border-r border-white/[0.07] bg-[#0d1410] transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          w-[264px]`}
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5">
          <div>
            <img src="/bashiri-logo-horizontal.svg" alt="Bashiri Elite" className="h-6 w-auto object-contain" />
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#79e5b8]">Admin workspace</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-white/55 md:hidden" aria-label="Close navigation">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        <div className="border-b border-white/[0.06] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Signed in as</p>
          <p className="mt-1 truncate text-sm font-bold text-white/80">@{admin?.username || admin?.phone_number || "Administrator"}</p>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => handleNavClick(item.href)}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition ${active ? "bg-[#61d7a5]/[0.11] text-[#8de9bd]" : "text-white/55 hover:bg-white/[0.045] hover:text-white/90"}`}
                    >
                      {active && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-[#61d7a5]" />}
                      <Icon size={16} strokeWidth={active ? 2.3 : 1.8} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.07] px-3 py-4">
          <button
            type="button"
            onClick={() => { logout(); router.replace("/admin/login"); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#f18f75] transition hover:bg-[#f18f75]/[0.08]"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
