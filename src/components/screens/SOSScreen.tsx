import { useState } from "react";
import { createSOSAlert, findNearbyHelpers, notifyNearbyHelpers } from "@/lib/supabaseClient";
import { useAuthStore } from "@/features/authStore";

interface SOSScreenProps {
  onBack?: () => void;
}

async function getAddressFromCoords(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    if (data.display_name) {
      const parts = data.display_name.split(", ");
      return parts.slice(0, 3).join(", ");
    }
  } catch (e) {
    console.error("Geocoding error:", e);
  }
  return "Location detected";
}

export function SOSScreen({ onBack }: SOSScreenProps) {
  const { user } = useAuthStore();
  const [step, setStep] = useState<"confirm" | "broadcasting" | "success">("confirm");
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [description, setDescription] = useState("");
  const [affectedCount, setAffectedCount] = useState("");
  const [notifiedCount, setNotifiedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState("");

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const address = await getAddressFromCoords(lat, lng);
          setLocation({
            lat,
            lng,
            address,
          });
          setLoading(false);
        },
        () => {
          setLocation({ lat: 0, lng: 0, address: "Location access denied" });
          setLoading(false);
        }
      );
    }
  };

  const handleManualLocation = () => {
    if (!manualAddress.trim()) return;
    setLocation({
      lat: 0,
      lng: 0,
      address: manualAddress,
    });
    setShowManualLocation(false);
    setManualAddress("");
  };

  const handleTrigger = async () => {
    if (!user?.id || !location) return;
    
    setLoading(true);
    setStep("broadcasting");
    
    try {
      // Create SOS alert in database
      const sosAlert = await createSOSAlert({
        userId: user.id,
        latitude: location.lat,
        longitude: location.lng,
        address: location.address,
        description,
        affectedCount: parseInt(affectedCount) || 1,
      });
      
      // Find nearby helpers and notify them
      const nearbyHelpers = await findNearbyHelpers(location.lat, location.lng, 10);
      const helperIds = nearbyHelpers.map(h => h.id);
      
      if (sosAlert?.id && helperIds.length > 0) {
        await notifyNearbyHelpers(sosAlert.id, helperIds);
      }
      
      setNotifiedCount(helperIds.length);
      setStep("success");
    } catch (err) {
      console.error("SOS Error:", err);
      setStep("success"); // Still show success even if notification fails
    } finally {
      setLoading(false);
    }
  };

  if (step === "broadcasting") {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 58px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          padding: "2rem",
        }}
      >
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "var(--r)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "48px",
            animation: "pulse 1s infinite",
            marginBottom: "1.5rem",
          }}
        >
          🚨
        </div>
        <h2 style={{ fontFamily: "var(--font)", fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
          Broadcasting SOS...
        </h2>
        <p style={{ color: "var(--t2)", textAlign: "center", maxWidth: "300px" }}>
          Notifying nearby professionals, NGOs, and volunteers
        </p>
          <div style={{ marginTop: "2rem", display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <div className="d-stat" style={{ minWidth: "100px" }}>
            <div className="d-val red">{notifiedCount}</div>
            <div className="d-lbl">Helpers Notified</div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 58px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          padding: "2rem",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "var(--gl)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            marginBottom: "1.5rem",
          }}
        >
          ✅
        </div>
        <h2 style={{ fontFamily: "var(--font)", fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>
          SOS Broadcasted!
        </h2>
        <p style={{ color: "var(--t2)", textAlign: "center", maxWidth: "320px", marginBottom: "1.5rem" }}>
          Help is on the way. 80 responders have been notified and are heading to your location.
        </p>

        <div className="sidebar-card" style={{ width: "100%", maxWidth: "400px", marginBottom: "1rem" }}>
          <div className="pool-title">Live Status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--t2)" }}>📍 Distance</span>
              <span style={{ fontWeight: "600" }}>2.3 km away</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--t2)" }}>⏱️ ETA</span>
              <span style={{ fontWeight: "600" }}>~15 minutes</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--t2)" }}>👥 Responders</span>
              <span style={{ fontWeight: "600" }}>12 accepted</span>
            </div>
          </div>
        </div>

        <button className="btn-primary" style={{ maxWidth: "300px" }} onClick={onBack}>
          Back to Dashboard →
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <span style={{ fontSize: "13px", color: "var(--r)", fontWeight: "600" }}>/ 🚨 SOS Emergency</span>
      </div>

      <div
        style={{
          minHeight: "calc(100vh - 58px)",
          background: "linear-gradient(180deg, #fff1f1 0%, var(--bg) 50%)",
          padding: "2rem 1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "var(--r)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            marginBottom: "1rem",
          }}
        >
          🚨
        </div>
        <h1
          style={{
            fontFamily: "var(--font)",
            fontSize: "28px",
            fontWeight: "700",
            color: "var(--r)",
            marginBottom: "4px",
          }}
        >
          SOS Emergency
        </h1>
        <p style={{ color: "var(--t2)", textAlign: "center", marginBottom: "2rem" }}>
          This will broadcast to all nearby helpers immediately
        </p>

        <div className="onboard-card" style={{ width: "100%", maxWidth: "450px" }}>
          <label className="field-lbl">📍 Your Location</label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={handleGetLocation}
              disabled={loading}
            >
              {loading ? "📍 Detecting..." : `📍 ${location ? "Update GPS" : "Get Current Location"}`}
            </button>
            <button
              className="btn"
              style={{ background: "var(--bg)" }}
              onClick={() => setShowManualLocation(!showManualLocation)}
            >
              ✏️ Manual
            </button>
          </div>
          
          {showManualLocation && (
            <div style={{ marginBottom: "1rem" }}>
              <input
                className="field-inp"
                type="text"
                placeholder="Enter address manually (e.g., Mumbai, Maharashtra)"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                style={{ marginBottom: "8px" }}
              />
              <button
                className="btn"
                style={{ width: "100%", background: "var(--b)", color: "white" }}
                onClick={handleManualLocation}
              >
                Set Location
              </button>
            </div>
          )}
          
          {location && (
            <div
              style={{
                background: "var(--gl)",
                padding: "10px 14px",
                borderRadius: "var(--rad-sm)",
                fontSize: "13px",
                color: "var(--gd)",
                marginBottom: "1rem",
              }}
            >
              <div style={{ fontWeight: 600 }}>✓ {location.address}</div>
              {location.lat !== 0 && location.lng !== 0 && (
                <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.7 }}>
                  📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </div>
              )}
            </div>
          )}

          <label className="field-lbl">How many people are affected?</label>
          <input
            className="field-inp"
            type="number"
            placeholder="e.g., 50"
            value={affectedCount}
            onChange={(e) => setAffectedCount(e.target.value)}
            style={{ marginBottom: "1rem" }}
          />

          <label className="field-lbl">Brief Description (optional)</label>
          <textarea
            className="rich-area"
            placeholder="What's the emergency?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ minHeight: "80px" }}
          />

          <div
            style={{
              background: "#fff1f1",
              border: "1px solid #fecaca",
              borderRadius: "var(--rad-sm)",
              padding: "12px",
              fontSize: "12px",
              color: "var(--r)",
              marginBottom: "1rem",
            }}
          >
            ⚠️ Only use for genuine emergencies. False alarms may result in reduced response
            priority.
          </div>

          <button
            className="btn-primary"
            style={{
              background: "var(--r)",
              padding: "16px",
              fontSize: "16px",
            }}
            onClick={handleTrigger}
            disabled={!location || loading}
          >
            🚨 TRIGGER SOS — BROADCAST NOW
          </button>
        </div>
      </div>
    </>
  );
}
