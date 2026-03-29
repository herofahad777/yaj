import { useState, useEffect } from "react";
import { getAllVerificationRequests, approveVerification, rejectVerification } from "@/lib/supabaseClient";
import { useAuthStore } from "@/features/authStore";

interface VerificationRequest {
  id?: string;
  profile_id: string;
  full_name: string;
  profession: string;
  specialization?: string;
  license_number?: string;
  organization_name?: string;
  certificate_url?: string;
  id_proof_url?: string;
  status?: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  created_at?: string;
}

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
      doctor: "🩺",
      nurse: "👩‍⚕️",
      lawyer: "⚖️",
      engineer: "🏗️",
      paramedic: "🚑",
      teacher: "📚",
      social_worker: "🤝",
      government_servant: "🏛️",
    };
    return icons[profession] || "📋";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <span style={{ fontSize: "13px", color: "var(--t2)" }}>/ Admin Panel</span>
      </div>

      <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "1.5rem" }}>
          🔧 Admin Panel
        </h1>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
          {(["pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              className={`btn ${filter === f ? "btn-green" : ""}`}
              style={{
                background: filter === f ? "var(--g)" : "var(--bg)",
                color: filter === f ? "#fff" : "var(--t2)",
                textTransform: "capitalize",
              }}
              onClick={() => setFilter(f)}
            >
              {f} ({requests.length})
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--t2)" }}>
            Loading...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--t2)" }}>
            <div style={{ fontSize: "48px", marginBottom: "1rem" }}>📭</div>
            <div>No {filter} requests</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {requests.map((request) => (
              <div
                key={request.id}
                style={{
                  background: "white",
                  border: "1px solid var(--bd)",
                  borderRadius: "12px",
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div style={{ fontSize: "40px" }}>
                  {getProfessionIcon(request.profession)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: "16px" }}>
                    {request.full_name}
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--t2)", textTransform: "capitalize" }}>
                    {request.profession} {request.specialization && `• ${request.specialization}`}
                  </div>
                  {request.license_number && (
                    <div style={{ fontSize: "13px", color: "var(--t3)", marginTop: "4px" }}>
                      License: {request.license_number}
                    </div>
                  )}
                  {request.organization_name && (
                    <div style={{ fontSize: "13px", color: "var(--t3)" }}>
                      Org: {request.organization_name}
                    </div>
                  )}
                  <div style={{ fontSize: "12px", color: "var(--t3)", marginTop: "4px" }}>
                    Submitted: {request.created_at ? formatDate(request.created_at) : "N/A"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {request.certificate_url && (
                    <a
                      href={request.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{ background: "var(--bg)", fontSize: "12px" }}
                    >
                      📄 Certificate
                    </a>
                  )}
                  {request.id_proof_url && (
                    <a
                      href={request.id_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{ background: "var(--bg)", fontSize: "12px" }}
                    >
                      🪪 ID Proof
                    </a>
                  )}
                  {filter === "pending" && (
                    <>
                      <button
                        className="btn"
                        style={{ background: "#DCFCE7", color: "#16A34A" }}
                        onClick={() => request.id && handleApprove(request.id)}
                        disabled={actionLoading || !request.id}
                      >
                        ✅ Approve
                      </button>
                      <button
                        className="btn"
                        style={{ background: "#FEE2E2", color: "#DC2626" }}
                        onClick={() => setSelectedRequest(request)}
                      >
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
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-box" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Verification Request</h3>
              <button className="close-btn" onClick={() => setSelectedRequest(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: "1rem" }}>
                <strong>{selectedRequest.full_name}</strong>
                <br />
                <span style={{ color: "var(--t2)", fontSize: "14px" }}>
                  {selectedRequest.profession}
                </span>
              </div>

              <label className="field-lbl">Rejection Reason</label>
              <textarea
                className="rich-area"
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ minHeight: "100px", marginBottom: "1rem" }}
              />

              <div className="modal-actions">
                <button
                  className="btn-primary"
                  style={{ background: "#EF4444" }}
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || actionLoading}
                >
                  {actionLoading ? "Rejecting..." : "Reject"}
                </button>
                <button className="btn-secondary" onClick={() => setSelectedRequest(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
