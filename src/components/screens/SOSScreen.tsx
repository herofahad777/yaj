import { useState } from "react";

interface SOSScreenProps {
  onBack?: () => void;
}

export function SOSScreen({ onBack }: SOSScreenProps) {
  const [step, setStep] = useState<"confirm" | "broadcasting" | "success">("confirm");
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [description, setDescription] = useState("");
  const [affectedCount, setAffectedCount] = useState("");

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: "Detected automatically",
          });
        },
        () => {
          setLocation({ lat: 0, lng: 0, address: "Location access denied" });
        }
      );
    }
  };

  const handleTrigger = () => {
    setStep("broadcasting");
    setTimeout(() => {
      setStep("success");
    }, 3000);
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
            <div className="d-val red">23</div>
            <div className="d-lbl">Doctors Notified</div>
          </div>
          <div className="d-stat" style={{ minWidth: "100px" }}>
            <div className="d-val orange">12</div>
            <div className="d-lbl">Engineers</div>
          </div>
          <div className="d-stat" style={{ minWidth: "100px" }}>
            <div className="d-val green">45</div>
            <div className="d-lbl">Volunteers</div>
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
          <button
            className="btn-primary"
            style={{ marginBottom: "8px" }}
            onClick={handleGetLocation}
          >
            📍 {location ? "Update Location" : "Get Current Location"}
          </button>
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
              ✓ {location.address}
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
            disabled={!location}
          >
            🚨 TRIGGER SOS — BROADCAST NOW
          </button>
        </div>
      </div>
    </>
  );
}
