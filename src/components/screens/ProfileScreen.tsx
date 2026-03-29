import { useState, useEffect } from "react";
import { useAuthStore } from "@/features/authStore";
import { supabase } from "@/lib/supabaseClient";

interface ProfileScreenProps {
  onBack?: () => void;
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { user, profile, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    city: "",
    district: "",
    state: "",
    serviceRadius: "city" as "city" | "nation" | "world",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        city: (profile as any).city || "",
        district: (profile as any).district || "",
        state: (profile as any).state || "",
        serviceRadius: (profile as any).service_radius || "city",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          service_radius: formData.serviceRadius,
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      await fetchProfile(user.id);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setMessage({ type: "error", text: err.message || "Failed to save profile" });
    } finally {
      setSaving(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (!user?.id) return;
          
          setLoading(true);
          try {
            const { error } = await supabase
              .from("profiles")
              .update({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                last_location_update: new Date().toISOString(),
              })
              .eq("id", user.id);
            
            if (error) throw error;
            await fetchProfile(user.id);
            setMessage({ type: "success", text: "Location updated!" });
          } catch (err: any) {
            setMessage({ type: "error", text: err.message });
          } finally {
            setLoading(false);
          }
        },
        () => {
          setMessage({ type: "error", text: "Location access denied" });
        }
      );
    }
  };

  return (
    <>
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <span style={{ fontSize: "13px", color: "var(--t2)" }}>/ Account Profile</span>
      </div>

      <div style={{ padding: "1.5rem", maxWidth: "600px", margin: "0 auto" }}>
        <div className="onboard-card">
          <div className="ob-title">Account Profile</div>
          <div className="ob-sub">Manage your personal information</div>

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

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="field-lbl">Full Name</label>
              <input
                className="field-inp"
                type="text"
                placeholder="Your full name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div>
              <label className="field-lbl">Phone Number</label>
              <input
                className="field-inp"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="field-lbl">📍 Current Location</label>
              <button
                className="btn"
                style={{ width: "100%", marginBottom: "8px" }}
                onClick={handleGetLocation}
                disabled={loading}
              >
                {loading ? "Getting location..." : "📍 Update GPS Location"}
              </button>
              {(profile as any)?.latitude && (
                <div style={{ fontSize: "12px", color: "var(--t2)" }}>
                  Last updated: {(profile as any).last_location_update 
                    ? new Date((profile as any).last_location_update).toLocaleString() 
                    : "Just now"}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="field-lbl">City</label>
                <input
                  className="field-inp"
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <label className="field-lbl">District</label>
                <input
                  className="field-inp"
                  type="text"
                  placeholder="District"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="field-lbl">State</label>
              <input
                className="field-inp"
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <div>
              <label className="field-lbl">🌍 Service Radius</label>
              <select
                className="field-inp"
                value={formData.serviceRadius}
                onChange={(e) => setFormData({ ...formData, serviceRadius: e.target.value as any })}
              >
                <option value="city">📍 City Only - Help people in my city</option>
                <option value="nation">🇮🇳 Nationwide - Help anywhere in India</option>
                <option value="world">🌍 Worldwide - Help anywhere in the world</option>
              </select>
            </div>
          </div>

          <div className="ob-actions" style={{ marginTop: "1.5rem" }}>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="onboard-card" style={{ marginTop: "1rem" }}>
          <div className="ob-title">Account Information</div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--t2)" }}>Email</span>
              <span>{user?.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--t2)" }}>Verification Status</span>
              <span style={{ 
                color: profile?.is_verified ? "var(--gd)" : "var(--t2)",
                fontWeight: profile?.is_verified ? 600 : 400
              }}>
                {profile?.is_verified ? "✅ Verified Helper" : "Not Verified"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--t2)" }}>Roles</span>
              <span>{profile?.roles?.join(", ") || "User"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--t2)" }}>Member Since</span>
              <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
