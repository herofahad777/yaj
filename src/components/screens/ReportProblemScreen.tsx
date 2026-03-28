import { useState } from "react";
import type { ProblemCategory } from "@/types";

interface ReportProblemScreenProps {
  onBack?: () => void;
  onSubmit?: () => void;
}

const CATEGORIES: { value: ProblemCategory; icon: string; label: string }[] = [
  { value: "medical", icon: "🏥", label: "Medical Emergency" },
  { value: "water", icon: "💧", label: "Water Crisis" },
  { value: "food", icon: "🍽️", label: "Food & Hunger" },
  { value: "shelter", icon: "🏠", label: "Shelter / Housing" },
  { value: "disaster", icon: "🚨", label: "Natural Disaster" },
  { value: "education", icon: "📚", label: "Education" },
  { value: "legal", icon: "⚖️", label: "Legal Aid" },
  { value: "other", icon: "📋", label: "Other" },
];

export function ReportProblemScreen({ onBack, onSubmit }: ReportProblemScreenProps) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<ProblemCategory | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubmit?.();
    }, 1500);
  };

  return (
    <>
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <span style={{ fontSize: "13px", color: "var(--t2)" }}>/ Report a Problem</span>
      </div>

      <div className="onboard-wrap" style={{ alignItems: "flex-start", paddingTop: "2rem" }}>
        <div className="onboard-card">
          <div className="step-track">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`step-seg ${i <= step ? "done" : ""}`}></div>
            ))}
          </div>

          {step === 0 && (
            <>
              <div className="ob-title">What's the problem? 🔍</div>
              <div className="ob-sub">Select a category that best describes the issue</div>

              <div className="cat-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "1.5rem" }}>
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.value}
                    className={`cat-card ${category === cat.value ? "sel" : ""}`}
                    onClick={() => setCategory(cat.value)}
                  >
                    <div className="cat-icon">{cat.icon}</div>
                    <div className="cat-name">{cat.label}</div>
                  </div>
                ))}
              </div>

              <div className="ob-actions">
                <button
                  className="btn-primary"
                  onClick={() => setStep(1)}
                  disabled={!category}
                >
                  Continue →
                </button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="ob-title">Tell us more 📝</div>
              <div className="ob-sub">Describe the problem in your own words (your language is fine!)</div>

              <label className="field-lbl">Short Title</label>
              <input
                className="field-inp"
                placeholder="e.g., Water shortage in our village"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <label className="field-lbl">Description</label>
              <textarea
                className="rich-area"
                style={{ minHeight: "150px" }}
                placeholder="Describe the problem in detail... When did it start? How many people are affected?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="ob-actions">
                <button className="btn-primary" onClick={() => setStep(2)} disabled={!title || !description}>
                  Continue →
                </button>
                <button className="btn-secondary" onClick={() => setStep(0)}>
                  ← Back
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="ob-title">Add Photos & Location 📍</div>
              <div className="ob-sub">Photos help verify the problem. GPS ensures helpers find you.</div>

              <label className="field-lbl">Upload Photos</label>
              <div className="upload-zone" style={{ marginBottom: "1rem" }}>
                <div className="icon">📸</div>
                <p>
                  Tap to <strong>add photos</strong>
                </p>
                <p style={{ fontSize: "11px", marginTop: "4px" }}>Before → Progress → After helps track impact</p>
              </div>

              <label className="field-lbl">Location</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "1rem",
                }}
              >
                <button
                  className="btn-primary"
                  style={{ flex: 1 }}
                  onClick={handleGetLocation}
                >
                  📍 {location ? "Update Location" : "Get Current Location"}
                </button>
                {location && (
                  <span style={{ fontSize: "12px", color: "var(--g)" }}>✓ Detected</span>
                )}
              </div>
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
                  📍 {location.address}
                </div>
              )}

              <div className="ob-actions">
                <button
                  className="btn-primary"
                  onClick={() => setStep(3)}
                  disabled={!location}
                >
                  Continue →
                </button>
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  ← Back
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="ob-title">Support Needed 💰</div>
              <div className="ob-sub">Do you need financial support? (Optional)</div>

              <label className="field-lbl">Amount Needed (₹)</label>
              <input
                className="field-inp"
                type="number"
                placeholder="e.g., 50000 (leave empty if not needed)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: "var(--rad)",
                  padding: "14px",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ fontSize: "13px", color: "var(--t2)", marginBottom: "8px" }}>
                  📋 Summary
                </div>
                <div style={{ fontSize: "13px" }}>
                  <strong>Category:</strong> {CATEGORIES.find((c) => c.value === category)?.label}
                </div>
                <div style={{ fontSize: "13px" }}>
                  <strong>Title:</strong> {title}
                </div>
                <div style={{ fontSize: "13px" }}>
                  <strong>Location:</strong> {location?.address}
                </div>
                {amount && (
                  <div style={{ fontSize: "13px" }}>
                    <strong>Amount:</strong> ₹{parseInt(amount).toLocaleString("en-IN")}
                  </div>
                )}
              </div>

              <div className="pending-badge" style={{ marginBottom: "1rem" }}>
                ⏳ Will go to ASHA Worker / AI Verification
              </div>

              <div className="ob-actions">
                <button
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Problem →"}
                </button>
                <button className="btn-secondary" onClick={() => setStep(2)}>
                  ← Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
