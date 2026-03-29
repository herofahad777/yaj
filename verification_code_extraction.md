# Verification System Code Extraction

This document contains the complete React components, Supabase API functions, and SQL schema for the Verification System and its corresponding Admin Panel, making it easy to migrate to your new project.

## 1. Supabase SQL Schema
Run this in your Supabase SQL Editor to set up the Verification table, Row Level Security (RLS) policies, and the storage bucket for verification documents.

```sql
-- ========================================
-- VERIFICATION REQUESTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS helper_verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    profession TEXT NOT NULL,
    specialization TEXT,
    license_number TEXT,
    organization_name TEXT,
    certificate_url TEXT,
    id_proof_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE helper_verification_requests ENABLE ROW LEVEL SECURITY;

-- Helper verification requests policies
CREATE POLICY "Users can create verification requests"
    ON helper_verification_requests FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view their own verification requests"
    ON helper_verification_requests FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Anyone can view approved verification requests"
    ON helper_verification_requests FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Profile owners can update their own requests"
    ON helper_verification_requests FOR UPDATE
    USING (auth.uid() = profile_id AND status = 'pending');

-- Admin bypass (Optional: add a policy for admins to SELECT/UPDATE all requests)
-- e.g. USING ((SELECT 'admin' = ANY(roles) FROM profiles WHERE id = auth.uid()));

-- ========================================
-- STORAGE BUCKET FOR VERIFICATION DOCS
-- ========================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification_docs', 'verification_docs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view verification documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'verification_docs');

CREATE POLICY "Authenticated users can upload verification documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'verification_docs' AND auth.uid() IS NOT NULL);
```

---

## 2. API Functions (`supabaseClient.ts`)
Copy these functions to the file where you manage your Supabase client connections and queries.

```typescript
// ========================================
// VERIFICATION FUNCTIONS
// ========================================

export interface VerificationRequest {
  id?: string;
  profile_id: string;
  full_name: string;
  profession: string;
  specialization?: string;
  license_number?: string;
  organization_name?: string;
  certificate_url?: string;
  id_proof_url?: string;
  status?: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at?: string;
}

export async function submitVerificationRequest(data: {
  profileId: string;
  fullName: string;
  profession: string;
  specialization?: string;
  licenseNumber?: string;
  organizationName?: string;
  certificateFile?: File;
  idProofFile?: File;
}): Promise<VerificationRequest> {
  const { profileId, fullName, profession, specialization, licenseNumber, organizationName, certificateFile, idProofFile } = data;
  
  let certificateUrl = '';
  let idProofUrl = '';

  // Upload certificate to storage
  if (certificateFile) {
    const certPath = `${profileId}/certificate_${Date.now()}_${certificateFile.name}`;
    const { error: certError } = await supabase.storage
      .from('verification_docs')
      .upload(certPath, certificateFile);
    
    if (certError) throw new Error('Failed to upload certificate');
    
    const { data: certUrlData } = supabase.storage
      .from('verification_docs')
      .getPublicUrl(certPath);
    certificateUrl = certUrlData.publicUrl;
  }

  // Upload ID proof to storage
  if (idProofFile) {
    const idPath = `${profileId}/idproof_${Date.now()}_${idProofFile.name}`;
    const { error: idError } = await supabase.storage
      .from('verification_docs')
      .upload(idPath, idProofFile);
    
    if (idError) throw new Error('Failed to upload ID proof');
    
    const { data: idUrlData } = supabase.storage
      .from('verification_docs')
      .getPublicUrl(idPath);
    idProofUrl = idUrlData.publicUrl;
  }

  // Save verification request to database
  const { data: request, error } = await supabase
    .from('helper_verification_requests')
    .insert({
      profile_id: profileId,
      full_name: fullName,
      profession,
      specialization: specialization || null,
      license_number: licenseNumber || null,
      organization_name: organizationName || null,
      certificate_url: certificateUrl || null,
      id_proof_url: idProofUrl || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return request;
}

export async function getVerificationStatus(profileId: string): Promise<VerificationRequest | null> {
  const { data, error } = await supabase
    .from('helper_verification_requests')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getMyVerificationRequest(profileId: string): Promise<VerificationRequest | null> {
  const { data, error } = await supabase
    .from('helper_verification_requests')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

// ----------------------------------------
// Admin Functions
// ----------------------------------------

export async function getAllVerificationRequests(status?: 'pending' | 'approved' | 'rejected'): Promise<VerificationRequest[]> {
  let query = supabase
    .from('helper_verification_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function approveVerification(requestId: string, adminId: string): Promise<void> {
  const { error } = await supabase
    .from('helper_verification_requests')
    .update({
      status: 'approved',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) throw error;
}

export async function rejectVerification(requestId: string, reason: string, adminId: string): Promise<void> {
  const { error } = await supabase
    .from('helper_verification_requests')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) throw error;
}
```

---

## 3. Frontend Component: `VerificationScreen.tsx`
This provides the onboarding flow for a user to submit their verification documents. Ensure `useAuthStore` matches your new project's authentication state implementation.

```tsx
import { useState, useEffect, useRef } from "react";
// Change below path to where your api functions are located
import { submitVerificationRequest, getMyVerificationRequest } from "@/lib/supabaseClient";
// Mock auth store import - adapt this to your project's auth method
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
  const { user } = useAuthStore();
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

  useEffect(() => {
    checkExistingRequest();
  }, []);

  const checkExistingRequest = async () => {
    try {
      setLoadingStatus(true);
      if (!user?.id) return;
      
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
      if (type === "certificate") setCertificateFile(file);
      else setIdProofFile(file);
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

      setExistingRequest({ status: "pending" });
    } catch (err: any) {
      console.error("Verification submission error:", err);
      setError(err.message || "Failed to submit verification request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="onboard-wrap">
        <div className="onboard-card" style={{ textAlign: "center", padding: "3rem" }}>Loading...</div>
      </div>
    );
  }

  if (existingRequest?.status === "pending") {
    return (
      <div className="success-screen">
        <div className="success-icon" style={{ background: "#FEF3C7" }}>⏳</div>
        <div className="success-title">Verification Pending</div>
        <div className="success-sub">
          Your verification request has been submitted and is awaiting admin approval.
        </div>
        <button className="btn-primary" onClick={onComplete}>Back to Dashboard →</button>
      </div>
    );
  }

  if (existingRequest?.status === "rejected") {
    return (
      <div className="success-screen">
        <div className="success-icon" style={{ background: "#FEE2E2" }}>❌</div>
        <div className="success-title">Verification Rejected</div>
        <div className="success-sub">
          Your verification request was rejected.
          <br /><strong>Reason:</strong> {existingRequest.rejection_reason || "Please contact support"}
        </div>
        <button className="btn-primary" onClick={() => setExistingRequest(null)}>Submit Again →</button>
      </div>
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

          {error && <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "12px", borderRadius: "8px", marginBottom: "1rem" }}>⚠️ {error}</div>}

          {step === 0 && (
            <>
              <div className="ob-title">Professional Verification 🩺</div>
              <div className="ob-sub">Get verified to help people in your area of expertise.</div>
              <div className="role-grid">
                {PROFESSIONS.map((prof) => (
                  <div key={prof.value} className={`role-card ${profession === prof.value ? "sel" : ""}`} onClick={() => setProfession(prof.value)}>
                    <div className="role-icon">{prof.icon}</div>
                    <div className="role-name">{prof.label}</div>
                  </div>
                ))}
              </div>
              <div className="ob-actions">
                <button className="btn-primary" onClick={() => setStep(1)} disabled={!profession}>Continue →</button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="ob-title">License Details 📜</div>
              <label className="field-lbl">Specialization (optional)</label>
              <input className="field-inp" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />

              <label className="field-lbl">{selectedProf?.label} Registration / License Number</label>
              <input className="field-inp" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />

              <label className="field-lbl">Organization / Hospital (optional)</label>
              <input className="field-inp" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />

              <div className="ob-actions">
                <button className="btn-primary" onClick={() => setStep(2)} disabled={!licenseNumber}>Continue →</button>
                <button className="btn-secondary" onClick={() => setStep(0)}>← Back</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="ob-title">Upload Documents 📄</div>
              <label className="field-lbl">Certificate / License *</label>
              <input ref={certificateInputRef} type="file" accept="image/*,.pdf" onChange={handleFileSelect("certificate")} style={{ display: "none" }} />
              <div className="upload-zone" onClick={() => certificateInputRef.current?.click()}>
                {certificateFile ? <><div className="icon">✅</div><p>{certificateFile.name}</p></> : <><div className="icon">📄</div><p>Upload your <strong>license / certificate</strong></p></>}
              </div>

              <label className="field-lbl">ID Proof (Aadhaar/PAN) *</label>
              <input ref={idProofInputRef} type="file" accept="image/*,.pdf" onChange={handleFileSelect("idProof")} style={{ display: "none" }} />
              <div className="upload-zone" onClick={() => idProofInputRef.current?.click()}>
                {idProofFile ? <><div className="icon">✅</div><p>{idProofFile.name}</p></> : <><div className="icon">🪪</div><p>Upload your <strong>ID Proof</strong></p></>}
              </div>

              <div className="ob-actions">
                <button className="btn-primary" onClick={() => setStep(3)} disabled={!certificateFile || !idProofFile}>Continue →</button>
                <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="ob-title">Service Area 🌍</div>
              <div className="role-grid" style={{ gridTemplateColumns: "1fr" }}>
                {SERVICE_RADIUS_OPTIONS.map((opt) => (
                  <div key={opt.value} className={`role-card ${serviceRadius === opt.value ? "sel" : ""}`} onClick={() => setServiceRadius(opt.value)}>
                    <div className="role-icon">{opt.icon}</div>
                    <div><div className="role-name">{opt.label}</div><div className="role-desc">{opt.desc}</div></div>
                  </div>
                ))}
              </div>
              <div className="ob-actions">
                <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit for Verification →"}
                </button>
                <button className="btn-secondary" onClick={() => setStep(2)} disabled={submitting}>← Back</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
```

---

## 4. Admin Frontend Component: `AdminScreen.tsx`
This screen allows roles with "admin" access to review and accept/reject verification requests, including providing a custom rejection reason.

```tsx
import { useState, useEffect } from "react";
import { getAllVerificationRequests, approveVerification, rejectVerification, VerificationRequest } from "@/lib/supabaseClient";
import { useAuthStore } from "@/features/authStore";

interface AdminScreenProps {
  onBack?: () => void;
}

export function AdminScreen({ onBack }: AdminScreenProps) {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllVerificationRequests(filter);
      setRequests(data);
    } catch (err) {
      console.error("Error loading requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!user?.id) return;
    setActionLoading(true);
    try {
      await approveVerification(requestId, user.id);
      loadRequests();
      setSelectedRequest(null);
    } catch (err) {
      console.error("Error approving request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !selectedRequest.id || !rejectReason.trim() || !user?.id) return;
    
    setActionLoading(true);
    try {
      await rejectVerification(selectedRequest.id, rejectReason, user.id);
      loadRequests();
      setSelectedRequest(null);
      setRejectReason("");
    } catch (err) {
      console.error("Error rejecting request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const getProfessionIcon = (profession: string) => {
    const icons: Record<string, string> = {
      doctor: "🩺", nurse: "👩‍⚕️", lawyer: "⚖️", engineer: "🏗️", paramedic: "🚑", teacher: "📚", social_worker: "🤝", government_servant: "🏛️"
    };
    return icons[profession] || "📋";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <span style={{ fontSize: "13px", color: "var(--t2)" }}>/ Admin Panel</span>
      </div>

      <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "1.5rem" }}>🔧 Admin Panel</h1>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
          {(["pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              style={{
                background: filter === f ? "var(--g)" : "var(--bg)",
                color: filter === f ? "#fff" : "var(--t2)",
                textTransform: "capitalize",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer"
              }}
              onClick={() => setFilter(f)}
            >
              {f} ({requests.length})
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--t2)" }}>Loading...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--t2)" }}>
            <div style={{ fontSize: "48px", marginBottom: "1rem" }}>📭</div>
            <div>No {filter} requests</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {requests.map((request) => (
              <div key={request.id} style={{
                background: "white", border: "1px solid var(--bd)", borderRadius: "12px", padding: "1rem", display: "flex", alignItems: "center", gap: "1rem"
              }}>
                <div style={{ fontSize: "40px" }}>{getProfessionIcon(request.profession)}</div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: "16px" }}>{request.full_name}</div>
                  <div style={{ fontSize: "14px", color: "var(--t2)", textTransform: "capitalize" }}>
                    {request.profession} {request.specialization && `• ${request.specialization}`}
                  </div>
                  {request.license_number && <div style={{ fontSize: "13px", color: "var(--t3)", marginTop: "4px" }}>License: {request.license_number}</div>}
                  {request.organization_name && <div style={{ fontSize: "13px", color: "var(--t3)" }}>Org: {request.organization_name}</div>}
                  <div style={{ fontSize: "12px", color: "var(--t3)", marginTop: "4px" }}>
                    Submitted: {request.created_at ? formatDate(request.created_at) : "N/A"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {request.certificate_url && (
                    <a href={request.certificate_url} target="_blank" rel="noopener noreferrer" style={{ background: "var(--bg)", padding: "8px", borderRadius: "8px", textDecoration: "none", color: "black", fontSize: "12px" }}>
                      📄 Certificate
                    </a>
                  )}
                  {request.id_proof_url && (
                    <a href={request.id_proof_url} target="_blank" rel="noopener noreferrer" style={{ background: "var(--bg)", padding: "8px", borderRadius: "8px", textDecoration: "none", color: "black", fontSize: "12px" }}>
                      🪪 ID Proof
                    </a>
                  )}
                  {filter === "pending" && (
                    <>
                      <button style={{ background: "#DCFCE7", color: "#16A34A", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }} onClick={() => request.id && handleApprove(request.id)} disabled={actionLoading || !request.id}>
                        ✅ Approve
                      </button>
                      <button style={{ background: "#FEE2E2", color: "#DC2626", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }} onClick={() => setSelectedRequest(request)}>
                        ❌ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="modal-box" style={{ background: "white", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3>Reject Verification Request</h3>
              <button onClick={() => setSelectedRequest(null)} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>×</button>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <strong>{selectedRequest.full_name}</strong><br />
              <span style={{ color: "var(--t2)", fontSize: "14px" }}>{selectedRequest.profession}</span>
            </div>

            <label style={{ display: "block", marginBottom: "8px" }}>Rejection Reason</label>
            <textarea
              placeholder="Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: "100%", minHeight: "100px", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "1rem", boxSizing: "border-box" }}
            />

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #ccc", background: "white", cursor: "pointer" }} onClick={() => setSelectedRequest(null)}>
                Cancel
              </button>
              <button style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#EF4444", color: "white", cursor: "pointer" }} onClick={handleReject} disabled={!rejectReason.trim() || actionLoading}>
                {actionLoading ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```
