import { useState } from "react";
import { useAuthStore } from "@/features/authStore";
import { supabase } from "@/lib/supabaseClient";

interface SettingsScreenProps {
  onBack?: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { user, signOut } = useAuthStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    setDeleting(true);
    setMessage(null);
    
    try {
      // Delete user's profile first (due to foreign key constraints)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);
      
      if (profileError) throw profileError;
      
      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) throw authError;
      
      // Sign out and redirect
      await signOut();
      setMessage({ type: "success", text: "Account deleted successfully" });
      
    } catch (err: any) {
      console.error("Error deleting account:", err);
      setMessage({ type: "error", text: err.message || "Failed to delete account" });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <span style={{ fontSize: "13px", color: "var(--t2)" }}>/ Settings</span>
      </div>

      <div style={{ padding: "1.5rem", maxWidth: "600px", margin: "0 auto" }}>
        {/* Danger Zone */}
        <div className="onboard-card" style={{ border: "2px solid #fee2e2" }}>
          <div className="ob-title" style={{ color: "#dc2626" }}>
            ⚠️ Danger Zone
          </div>
          <p style={{ color: "var(--t2)", marginBottom: "1rem", fontSize: "14px" }}>
            Once you delete your account, there is no going back. Please be certain.
          </p>

          {message && (
            <div
              style={{
                background: message.type === "success" ? "#DCFCE7" : "#FEE2E2",
                color: message.type === "success" ? "#16A34A" : "#DC2626",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "14px",
              }}
            >
              {message.text}
            </div>
          )}

          {!showDeleteConfirm ? (
            <button
              className="btn"
              style={{ background: "#dc2626", color: "white" }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              🗑️ Delete My Account
            </button>
          ) : (
            <div style={{ background: "#fee2e2", padding: "1rem", borderRadius: "8px" }}>
              <p style={{ fontWeight: 600, marginBottom: "1rem", color: "#dc2626" }}>
                Are you sure? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn"
                  style={{ background: "#dc2626", color: "white", flex: 1 }}
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete My Account"}
                </button>
                <button
                  className="btn"
                  style={{ background: "var(--bg)", flex: 1 }}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* App Info */}
        <div className="onboard-card" style={{ marginTop: "1rem" }}>
          <div className="ob-title">About SEWA</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "1rem", fontSize: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--t2)" }}>Version</span>
              <span>1.0.0</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--t2)" }}>Platform</span>
              <span>SEWA - Social Impact Crowdfunding</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
