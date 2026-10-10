"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserDetail, updateUser, manualActivateSubscription, deleteUser, resetUserPassword } from "@/lib/api/admin";
import { BashiriButton } from "@/components/ui/Button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { AlertModal } from "@/components/ui/AlertModal";
import { useAdminAuthStore } from "@/stores/admin-auth.store";

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);
  const adminId = useAdminAuthStore((state) => state.admin?.id);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [reason, setReason] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; variant: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "info"
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    getUserDetail(userId)
      .then((data) => { if (active) setUser(data); })
      .catch((error: unknown) => setAlertModal({
        isOpen: true,
        title: "Imeshindwa kupakia",
        message: error instanceof Error ? error.message : "Imeshindwa kupakia maelezo ya mtumiaji.",
        variant: "error",
      }))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  function showActionError(error: unknown) {
    setAlertModal({
      isOpen: true,
      title: "Action imeshindikana",
      message: error instanceof Error ? error.message : "Tafadhali jaribu tena.",
      variant: "error",
    });
  }

  async function toggleBan() {
    setBusyAction("access");
    try {
      const updated = await updateUser(userId, { is_active: !user.is_active });
      setUser(updated);
    } catch (error) {
      showActionError(error);
    } finally {
      setBusyAction("");
    }
  }

  async function toggleAdmin() {
    setBusyAction("admin");
    try {
      const updated = await updateUser(userId, { is_staff: !user.is_staff });
      setUser(updated);
    } catch (error) {
      showActionError(error);
    } finally {
      setBusyAction("");
    }
  }

  async function handleManualActivate(plan: "weekly" | "monthly") {
    if (!reason.trim()) {
      setAlertModal({ isOpen: true, title: "Sababu inahitajika", message: "Andika sababu ya kuwasha subscription kabla ya kuendelea.", variant: "warning" });
      return;
    }
    setBusyAction("subscription");
    try {
      await manualActivateSubscription({ user_id: userId, plan, reason: reason.trim() });
      const refreshed = await getUserDetail(userId);
      setUser(refreshed);
      setReason("");
      setAlertModal({ isOpen: true, title: "Subscription imewashwa", message: `Mpango wa ${plan} umewashwa kwa mtumiaji.`, variant: "success" });
    } catch (error) {
      showActionError(error);
    } finally {
      setBusyAction("");
    }
  }

  async function handleDeleteUser() {
    setBusyAction("delete");
    try {
      await deleteUser(userId);
      router.push("/admin/users");
    } catch (error) {
      showActionError(error);
      setBusyAction("");
    }
  }

  function generateRandomPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let pwd = "";
    for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setNewPassword(pwd);
    setResetDone(false);
  }

  async function handleResetPassword() {
    if (newPassword.length < 4) return;
    setResetting(true);
    try {
      await resetUserPassword(userId, newPassword);
      setResetDone(true);
    } catch (error) {
      showActionError(error);
    } finally {
      setResetting(false);
    }
  }

  if (loading && !user) return <div className="flex min-h-64 items-center justify-center text-sm text-white/45">Inapakia maelezo ya mtumiaji...</div>;
  if (!user) return <div className="rounded-xl border border-[#f18f75]/20 bg-[#f18f75]/[0.06] p-5 text-sm text-[#f2a28b]">Mtumiaji hakuweza kupatikana. Tumia back kurudi kwenye directory.</div>;

  return (
    <div>
      <button onClick={() => router.back()} className="mb-4"><ArrowLeft size={20} style={{ color: "rgba(255,255,255,0.6)" }} /></button>

      <div className="rounded-2xl p-6 mb-6" style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">{user.username?.[0]?.toUpperCase() || "?"}</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-black text-white mb-1">@{user.username || "—"}</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{user.phone_number}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div><p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Accuracy</p><p className="text-lg font-black" style={{ color: "var(--success)" }}>{user.accuracy_percentage}%</p></div>
          <div><p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Streak</p><p className="text-lg font-black text-white">{user.current_streak}🔥</p></div>
          <div><p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Jumla</p><p className="text-lg font-black text-white">{user.total_predictions}</p></div>
          <div><p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>PRO</p><p className="text-lg font-black" style={{ color: user.is_subscription_active ? "#38BDF8" : "var(--danger)" }}>{user.is_subscription_active ? "Ndiyo" : "Hapana"}</p></div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <BashiriButton variant={user.is_active ? "outline" : "primary"} onClick={toggleBan}>
            {busyAction === "access" ? "Inahifadhi..." : user.is_active ? "Ban Mtumiaji" : "Ondoa Ban"}
          </BashiriButton>
          <BashiriButton variant="outline" onClick={toggleAdmin} disabled={busyAction !== "" || user.id === adminId}>
            {busyAction === "admin" ? "Inahifadhi..." : user.id === adminId ? "Akaunti yako ya Admin" : user.is_staff ? "Ondoa Admin" : "Fanya Admin"}
          </BashiriButton>
          <BashiriButton
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={busyAction !== "" || user.id === adminId}
            style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
          >
            <Trash2 size={16} className="mr-2" />
            Futa Mtumiaji
          </BashiriButton>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="rounded-2xl p-6 max-w-sm w-full" style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-lg font-black text-white mb-2">Futa Mtumiaji?</h3>
              <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                Una uhakika unataka kufuta mtumiaji @{user.username || "—"}? Hatua hii haiwezi kurudishwa.
              </p>
              <div className="flex gap-3 justify-end">
                <BashiriButton variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Ghairi
                </BashiriButton>
                <BashiriButton
                  onClick={handleDeleteUser}
                  loading={busyAction === "delete"}
                  disabled={busyAction !== ""}
                  style={{ background: "var(--danger)", borderColor: "var(--danger)" }}
                >
                  Futa
                </BashiriButton>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl p-6 mb-6" style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 className="text-sm font-black text-white mb-3">Amsha Subscription kwa Mkono (Support)</h2>
        <input
          className="w-full rounded-xl px-3 py-2 text-sm text-white bg-[#151515] outline-none mb-3"
          placeholder="Sababu (mfano: malipo yalithibitishwa nje ya app)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          <BashiriButton size="md" loading={busyAction === "subscription"} disabled={busyAction !== ""} onClick={() => handleManualActivate("weekly")}>Weekly</BashiriButton>
          <BashiriButton size="md" loading={busyAction === "subscription"} disabled={busyAction !== ""} onClick={() => handleManualActivate("monthly")}>Monthly</BashiriButton>
        </div>
      </div>

      <div className="rounded-2xl p-6 mb-6" style={{ background: "#111111", border: "1px solid rgba(255,214,0,0.15)" }}>
        <h2 className="text-sm font-black text-white mb-3">Badilisha Password (Support-Assisted)</h2>
        <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
          Thibitisha utambulisho wa mtumiaji NJE ya app (simu/WhatsApp) kabla ya kubonyeza hii.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 rounded-xl px-3 py-2 text-sm text-white bg-[#151515] outline-none"
            placeholder="Password mpya (angalau herufi 4)"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setResetDone(false); }}
          />
          <BashiriButton size="md" variant="outline" onClick={generateRandomPassword}>Tengeneza</BashiriButton>
        </div>
        {resetDone ? (
          <p className="text-xs font-bold" style={{ color: "var(--success)" }}>
            ✅ Imebadilishwa. Mpe mtumiaji: <span className="select-all">{newPassword}</span>
          </p>
        ) : (
          <BashiriButton size="md" loading={resetting} disabled={newPassword.length < 4} onClick={handleResetPassword}>
            Weka Password Mpya
          </BashiriButton>
        )}
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
      />
    </div>
  );
}
