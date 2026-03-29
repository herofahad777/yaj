import { useState } from "react";
import { respondToProblem } from "@/lib/supabaseClient";

interface ResponseModalProps {
  open: boolean;
  onClose: () => void;
  problem: {
    id: string;
    title: string;
    emoji: string;
    category: string;
  };
  helperId: string;
}

const RESPONSE_TYPES = [
  { 
    value: "offer_help", 
    icon: "🤝", 
    label: "Offer to Help", 
    desc: "I can personally help with this problem",
    color: "#10B981"
  },
  { 
    value: "advice", 
    icon: "💡", 
    label: "Give Advice", 
    desc: "Provide guidance and suggestions",
    color: "#3B82F6"
  },
  { 
    value: "escalate", 
    icon: "⚠️", 
    label: "Escalate", 
    desc: "Needs police/govt/NGO intervention",
    color: "#EF4444"
  },
];

export function ResponseModal({ open, onClose, problem, helperId }: ResponseModalProps) {
  const [responseType, setResponseType] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!responseType) return;

    setSubmitting(true);
    setError(null);

    try {
      await respondToProblem({
        problemId: problem.id,
        helperId: helperId,
        responseType: responseType as "offer_help" | "advice" | "escalate",
        message: message || undefined,
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setResponseType(null);
        setMessage("");
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting response:", err);
      setError(err.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Respond to Problem</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {submitted ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "48px", marginBottom: "1rem" }}>✅</div>
              <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
                Response Submitted!
              </div>
              <div style={{ fontSize: "14px", color: "var(--t2)" }}>
                The problem owner will be notified of your response.
              </div>
            </div>
          ) : (
            <>
              {/* Problem Info */}
              <div style={{ 
                display: "flex", 
                gap: "12px", 
                padding: "12px", 
                background: "var(--bg)", 
                borderRadius: "12px",
                marginBottom: "1.5rem"
              }}>
                <div style={{ fontSize: "32px" }}>{problem.emoji}</div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "14px", lineHeight: "1.4" }}>
                    {problem.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--t2)", textTransform: "capitalize", marginTop: "4px" }}>
                    {problem.category}
                  </div>
                </div>
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

              {/* Response Type Selection */}
              <label className="field-lbl">How would you like to help?</label>
              <div className="role-grid" style={{ marginBottom: "1.5rem" }}>
                {RESPONSE_TYPES.map((type) => (
                  <div
                    key={type.value}
                    className={`role-card ${responseType === type.value ? "sel" : ""}`}
                    onClick={() => setResponseType(type.value)}
                    style={{
                      borderColor: responseType === type.value ? type.color : undefined,
                      background: responseType === type.value ? `${type.color}10` : undefined,
                    }}
                  >
                    <div className="role-icon">{type.icon}</div>
                    <div className="role-name">{type.label}</div>
                    <div className="role-desc">{type.desc}</div>
                  </div>
                ))}
              </div>

              {/* Message */}
              <label className="field-lbl">Additional Message (optional)</label>
              <textarea
                className="rich-area"
                placeholder={
                  responseType === "offer_help" 
                    ? "Describe how you can help..."
                    : responseType === "advice"
                    ? "Share your expert advice..."
                    : "Explain why this needs escalation..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ minHeight: "100px", marginBottom: "1.5rem" }}
              />

              <div className="modal-actions">
                <button 
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={!responseType || submitting}
                >
                  {submitting ? "Submitting..." : "Submit Response"}
                </button>
                <button className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
