import { useState } from "react";

interface VerificationScreenProps {
  onBack?: () => void;
  onComplete?: () => void;
}

const PROFESSIONS = [
  { value: "doctor", icon: "🩺", label: "Doctor", registry: "NMC (National Medical Commission)" },
  { value: "nurse", icon: "👩‍⚕️", label: "Nurse", registry: "INC (Indian Nursing Council)" },
  { value: "lawyer", icon: "⚖️", label: "Lawyer", registry: "Bar Council of India" },
  { value: "engineer", icon: "🏗️", label: "Engineer", registry: "Govt. License Database" },
  { value: "paramedic", icon: "🚑", label: "Paramedic", registry: "State Health Department" },
  { value: "teacher", icon: "📚", label: "Teacher", registry: "Education Department" },
];

export function VerificationScreen({ onBack, onComplete }: VerificationScreenProps) {
  const [step, setStep] = useState(0);
  const [profession, setProfession] = useState<string | null>(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const selectedProf = PROFESSIONS.find((p) => p.value === profession);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 3000);
  };

  return (
    <>
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <span style={{ fontSize: "13px", color: "var(--t2)" }}>/ Professional Verification</span>
      </div>

      <div className="onboard-wrap">
        <div className="onboard-card">
          <div className="step-track">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`step-seg ${i <= step ? "done" : ""}`}></div>
            ))}
          </div>

          {step === 0 && (
            <>
              <div className="ob-title">Professional Verification 🩺</div>
              <div className="ob-sub">
                Get verified to help people in your area of expertise. Verification connects you
                with those who need your skills.
              </div>

              <div className="role-grid">
                {PROFESSIONS.map((prof) => (
                  <div
                    key={prof.value}
                    className={`role-card ${profession === prof.value ? "sel" : ""}`}
                    onClick={() => setProfession(prof.value)}
                  >
                    <div className="role-icon">{prof.icon}</div>
                    <div className="role-name">{prof.label}</div>
                  </div>
                ))}
              </div>

              {profession && selectedProf && (
                <div
                  style={{
                    background: "var(--gl)",
                    padding: "12px 14px",
                    borderRadius: "var(--rad-sm)",
                    fontSize: "13px",
                    marginBottom: "1rem",
                  }}
                >
                  <strong>Verification Source:</strong> {selectedProf.registry}
                </div>
              )}

              <div className="ob-actions">
                <button className="btn-primary" onClick={() => setStep(1)} disabled={!profession}>
                  Continue →
                </button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="ob-title">License Verification 📜</div>
              <div className="ob-sub">
                Enter your {selectedProf?.label} license/registration number for backend
                verification.
              </div>

              <label className="field-lbl">
                {selectedProf?.label} Registration / License Number
              </label>
              <input
                className="field-inp"
                placeholder={`e.g., MH-${Date.now().toString().slice(-6)}`}
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />

              <label className="field-lbl">Upload Proof Document</label>
              <div className="upload-zone" style={{ marginBottom: "1rem" }}>
                <div className="icon">📄</div>
                <p>
                  Upload your <strong>license / certificate</strong>
                </p>
                <p style={{ fontSize: "11px", marginTop: "4px" }}>JPG, PNG or PDF</p>
              </div>

              <div className="ob-actions">
                <button
                  className="btn-primary"
                  onClick={() => setStep(2)}
                  disabled={!licenseNumber}
                >
                  Verify Now →
                </button>
                <button className="btn-secondary" onClick={() => setStep(0)}>
                  ← Back
                </button>
              </div>
            </>
          )}

          {step === 2 && !verified && (
            <>
              <div className="ob-title">Verifying... 🔍</div>
              <div className="ob-sub">Please wait while we verify your credentials</div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "2rem 0",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "var(--gl)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    marginBottom: "1rem",
                    animation: "pulse 1.4s infinite",
                  }}
                >
                  {verifying ? "⏳" : "🔍"}
                </div>

                <div style={{ fontSize: "14px", color: "var(--t2)", textAlign: "center" }}>
                  {verifying ? (
                    <>
                      <div>Checking {selectedProf?.registry} database...</div>
                      <div style={{ marginTop: "8px" }}>Cross-referencing license number...</div>
                    </>
                  ) : (
                    <div>Starting verification...</div>
                  )}
                </div>
              </div>

              <div className="ob-actions">
                <button
                  className="btn-primary"
                  onClick={handleVerify}
                  disabled={verifying}
                >
                  {verifying ? "Verifying..." : "Start Verification"}
                </button>
                <button className="btn-secondary" onClick={() => setStep(1)} disabled={verifying}>
                  ← Back
                </button>
              </div>
            </>
          )}

          {step === 2 && verified && (
            <>
              <div className="success-screen">
                <div className="success-icon" style={{ background: "var(--gl)" }}>
                  ✅
                </div>
                <div className="success-title">Verification Complete!</div>
                <div className="success-sub">
                  Your {selectedProf?.label} credentials have been verified. You now have a{" "}
                  <strong>✓ Yuj Verified</strong> badge and can accept help requests in your
                  area.
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "var(--gl)",
                    padding: "12px 16px",
                    borderRadius: "var(--rad-sm)",
                    marginBottom: "1.5rem",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>✓</span>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>License Verified</div>
                    <div style={{ fontSize: "12px", color: "var(--t2)" }}>
                      {licenseNumber} • {selectedProf?.registry}
                    </div>
                  </div>
                </div>

                <button className="btn-primary" onClick={onComplete}>
                  Start Helping →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
