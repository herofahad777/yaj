import { useState, useEffect, useRef } from "react";
import { submitVerificationRequest, getMyVerificationRequest } from "@/lib/supabaseClient";
import { useAuthStore } from "@/features/authStore";

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
  { value: "social_worker", icon: "🤝", label: "Social Worker", registry: "NGO Registration" },
  { value: "government_servant", icon: "🏛️", label: "Govt Servant", registry: "Government ID" },
];

const SERVICE_RADIUS_OPTIONS = [
  { value: "city", icon: "📍", label: "City Only", desc: "Problems in my city" },
  { value: "nation", icon: "🇮🇳", label: "Nationwide", desc: "Anywhere in India" },
  { value: "world", icon: "🌍", label: "Worldwide", desc: "Anywhere in the world" },
];

export function VerificationScreen({ onBack, onComplete }: VerificationScreenProps) {
  const { user, profile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [profession, setProfession] = useState<string | null>(null);
  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [serviceRadius, setServiceRadius] = useState("city");
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  
  const certificateInputRef = useRef<HTMLInputElement>(null);
  const idProofInputRef = useRef<HTMLInputElement>(null);

  // Check for existing verification request on mount
  useEffect(() => {
    // If already verified, redirect back
    if (profile?.is_verified) {
      onComplete?.();
      return;
    }
    checkExistingRequest();
  }, [profile]);

  const checkExistingRequest = async () => {
    try {
      setLoadingStatus(true);
      if (!user?.id) {
        setLoadingStatus(false);
        return;
      }
      const request = await getMyVerificationRequest(user.id);
      setExistingRequest(request);
    } catch (err) {
      console.error("Error checking verification status:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const selectedProf = PROFESSIONS.find((p) => p.value === profession);

  const handleFileSelect = (type: "certificate" | "idProof") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "certificate") {
        setCertificateFile(file);
      } else {
        setIdProofFile(file);
      }
    }
  };

  const handleSubmit = async () => {
    if (!profession || !user?.id) return;
    
    setSubmitting(true);
    setError(null);

    try {
      await submitVerificationRequest({
        profileId: user.id,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
        profession: profession,
        specialization: specialization || undefined,
        licenseNumber: licenseNumber || undefined,
        organizationName: organizationName || undefined,
        certificateFile: certificateFile || undefined,
        idProofFile: idProofFile || undefined,
      });

      // Show pending status
      setExistingRequest({ status: "pending" });
    } catch (err: any) {
      console.error("Verification submission error:", err);
      setError(err.message || "Failed to submit verification request");
    } finally {
      setSubmitting(false);
    }
  };

  // Show existing request status
  if (loadingStatus) {
    return (
      <>
        <div className="detail-topbar">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <span style={{ fontSize: "13px", color: "var(--t2)" }}>/ Professional Verification</span>
        </div>
        <div className="onboard-wrap">
          <div className="onboard-card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "24px" }}>⏳</div>
            <div style={{ marginTop: "1rem", color: "var(--t2)" }}>Loading...</div>
          </div>
        </div>
      </>
    );
  }

  // Show pending status if already submitted
  if (existingRequest?.status === "pending") {
    return (
      <>
        <div className="detail-topbar">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <span style={{ fontSize: "13px", color: "var(--t2)" }}>/ Professional Verification</span>
        </div>
        <div className="onboard-wrap">
          <div className="onboard-card">
            <div className="success-screen">
              <div className="success-icon" style={{ background: "#FEF3C7" }}>⏳</div>
              <div className="success-title">Verification Pending</div>
              <div className="success-sub">
                Your verification request has been submitted and is awaiting admin approval.
                <br /><br />
                You'll be notified once your credentials are verified.
              </div>
              <button className="btn-primary" onClick={onComplete}>
                Back to Dashboard →
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show rejected status
  if (existingRequest?.status === "rejected") {
    return (
      <>
        <div className="detail-topbar">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <span style={{ fontSize: "13px", color: "var(--t2)" }}>/ Professional Verification</span>
        </div>
        <div className="onboard-wrap">
          <div className="onboard-card">
            <div className="success-screen">
              <div className="success-icon" style={{ background: "#FEE2E2" }}>❌</div>
              <div className="success-title">Verification Rejected</div>
              <div className="success-sub">
                Your verification request was rejected.
                <br />
                <strong>Reason:</strong> {existingRequest.rejection_reason || "Please contact support"}
                <br /><br />
                Please submit a new request with correct documents.
              </div>
              <button className="btn-primary" onClick={() => setExistingRequest(null)}>
                Submit Again →
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <span style={{ fontSize: "13px", color: "var(--t2)" }}>/ Professional Verification</span>
      </div>

      <div className="onboard-wrap">
        <div className="onboard-card">
          <div className="step-track">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`step-seg ${i <= step ? "done" : ""}`}></div>
            ))}
          </div>

          {error && (
            <div style={{ 
              background: "#FEE2E2", 
              color: "#DC2626", 
              padding: "12px", 
              borderRadius: "8px", 
              marginBottom: "1rem",
              fontSize: "14px"
            }}>
              ⚠️ {error}
            </div>
          )}

          {step === 0 && (
            <>
              <div className="ob-title">Professional Verification 🩺</div>
              <div className="ob-sub">
                Get verified to help people in your area of expertise. Verification connects you with those who need your skills.
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
                <div style={{
                  background: "var(--gl)",
                  padding: "12px 14px",
                  borderRadius: "var(--rad-sm)",
                  fontSize: "13px",
                  marginBottom: "1rem",
                }}>
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
              <div className="ob-title">License Details 📜</div>
              <div className="ob-sub">
                Enter your {selectedProf?.label} credentials for verification.
              </div>

              <label className="field-lbl">Specialization (optional)</label>
              <input
                className="field-inp"
                placeholder="e.g., Cardiologist, Civil Rights"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              />

              <label className="field-lbl">
                {selectedProf?.label} Registration / License Number
              </label>
              <input
                className="field-inp"
                placeholder="Enter license number"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />

              <label className="field-lbl">Organization / Hospital (optional)</label>
              <input
                className="field-inp"
                placeholder="e.g., Apollo Hospital"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />

              <div className="ob-actions">
                <button className="btn-primary" onClick={() => setStep(2)} disabled={!licenseNumber}>
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
              <div className="ob-title">Upload Documents 📄</div>
              <div className="ob-sub">
                Upload your professional certificates and ID proof for verification.
              </div>

              <label className="field-lbl">Certificate / License *</label>
              <input
                ref={certificateInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect("certificate")}
                style={{ display: "none" }}
              />
              <div 
                className="upload-zone" 
                onClick={() => certificateInputRef.current?.click()}
                style={{ cursor: "pointer", marginBottom: "1rem" }}
              >
                {certificateFile ? (
                  <>
                    <div className="icon">✅</div>
                    <p><strong>{certificateFile.name}</strong></p>
                    <p style={{ fontSize: "11px", marginTop: "4px" }}>Click to change</p>
                  </>
                ) : (
                  <>
                    <div className="icon">📄</div>
                    <p>Upload your <strong>license / certificate</strong></p>
                    <p style={{ fontSize: "11px", marginTop: "4px" }}>JPG, PNG or PDF</p>
                  </>
                )}
              </div>

              <label className="field-lbl">ID Proof (Aadhaar/PAN) *</label>
              <input
                ref={idProofInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect("idProof")}
                style={{ display: "none" }}
              />
              <div 
                className="upload-zone" 
                onClick={() => idProofInputRef.current?.click()}
                style={{ cursor: "pointer", marginBottom: "1rem" }}
              >
                {idProofFile ? (
                  <>
                    <div className="icon">✅</div>
                    <p><strong>{idProofFile.name}</strong></p>
                    <p style={{ fontSize: "11px", marginTop: "4px" }}>Click to change</p>
                  </>
                ) : (
                  <>
                    <div className="icon">🪪</div>
                    <p>Upload your <strong>ID Proof</strong></p>
                    <p style={{ fontSize: "11px", marginTop: "4px" }}>Aadhaar, PAN, or Passport</p>
                  </>
                )}
              </div>

              <div className="ob-actions">
                <button 
                  className="btn-primary" 
                  onClick={() => setStep(3)}
                  disabled={!certificateFile || !idProofFile}
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
              <div className="ob-title">Service Area 🌍</div>
              <div className="ob-sub">
                Select where you'd like to receive help requests.
              </div>

              <div className="role-grid" style={{ gridTemplateColumns: "1fr" }}>
                {SERVICE_RADIUS_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    className={`role-card ${serviceRadius === opt.value ? "sel" : ""}`}
                    onClick={() => setServiceRadius(opt.value)}
                    style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}
                  >
                    <div className="role-icon">{opt.icon}</div>
                    <div>
                      <div className="role-name">{opt.label}</div>
                      <div className="role-desc">{opt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                background: "var(--gl)",
                padding: "12px 14px",
                borderRadius: "var(--rad-sm)",
                fontSize: "13px",
                marginBottom: "1rem",
              }}>
                <strong>Selected:</strong> {SERVICE_RADIUS_OPTIONS.find(o => o.value === serviceRadius)?.label}
              </div>

              <div className="ob-actions">
                <button 
                  className="btn-primary" 
                  onClick={handleSubmit}
                  disabled={submitting || !profession || !licenseNumber}
                >
                  {submitting ? "Submitting..." : "Submit for Verification →"}
                </button>
                <button className="btn-secondary" onClick={() => setStep(2)} disabled={submitting}>
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
