import { useState } from "react";

interface AddProblemModalProps {
  open: boolean;
  onClose: () => void;
}

const STEP_TITLES = ["Choose Category", "Tell the Story", "Add Details & Docs", "Preview & Submit"];

export function AddProblemModal({ open, onClose }: AddProblemModalProps) {
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");

  if (!open) return null;

  const renderStepTrack = () => (
    <div className="modal-step-track">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`modal-step ${i < step ? "done" : i === step ? "active" : ""}`}
        ></div>
      ))}
    </div>
  );

  const renderBody = () => {
    if (step === 0) {
      return (
        <>
          <div className="cat-grid">
            <div
              className={`cat-card ${selectedCategory === "public" ? "sel" : ""}`}
              onClick={() => setSelectedCategory("public")}
            >
              <div className="cat-icon">🤝</div>
              <div className="cat-name">Public Problem</div>
              <div className="cat-desc">Medical, education, housing, legal needs & more</div>
            </div>
            <div
              className={`cat-card ${selectedCategory === "disaster" ? "sel" : ""}`}
              onClick={() => setSelectedCategory("disaster")}
            >
              <div className="cat-icon">🚨</div>
              <div className="cat-name">Disaster</div>
              <div className="cat-desc">
                Flood, fire, earthquake, cyclone — emergency mobilisation
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-primary" onClick={() => setStep(1)}>
              Next →
            </button>
          </div>
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <label className="field-lbl">Title</label>
          <input className="field-inp" placeholder="Give your cause a clear, honest title" />
          <label className="field-lbl" style={{ marginTop: "4px" }}>
            Tell the full story
          </label>
          <textarea
            className="rich-area"
            placeholder="Share everything — who needs help, why it's urgent, what will change with support…"
          ></textarea>
          <div className="modal-actions">
            <button className="btn-primary" onClick={() => setStep(2)}>
              Next →
            </button>
            <button className="btn-secondary" onClick={() => setStep(0)}>
              ← Back
            </button>
          </div>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <div className="field-row">
            <div>
              <label className="field-lbl">Amount Needed (₹)</label>
              <input className="field-inp" type="number" placeholder="e.g. 250000" />
            </div>
            <div>
              <label className="field-lbl">Location</label>
              <input className="field-inp" placeholder="City, State" />
            </div>
          </div>
          <div className="upload-zone">
            <div className="icon">📸</div>
            <p>
              Drop photos here or <strong>browse</strong>
            </p>
          </div>
          <div className="upload-zone">
            <div className="icon">📄</div>
            <p>
              Upload proof documents — medical reports, govt letters, etc.{" "}
              <strong>browse</strong>
            </p>
          </div>
          <div className="modal-actions">
            <button className="btn-primary" onClick={() => setStep(3)}>
              Preview →
            </button>
            <button className="btn-secondary" onClick={() => setStep(1)}>
              ← Back
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <div
          style={{
            background: "var(--bg)",
            borderRadius: "var(--rad)",
            padding: "1.25rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font)",
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "6px",
            }}
          >
            Your cause is ready to submit
          </div>
          <p style={{ fontSize: "13px", color: "var(--t2)", lineHeight: 1.6 }}>
            Our team will review it within 24 hours. Once verified, it will appear live
            on the dashboard and be shared with relevant professionals automatically.
          </p>
          <div className="pending-badge">⏳ Will appear as "Pending Verification"</div>
        </div>
        <div className="modal-actions">
          <button
            className="btn-primary"
            onClick={() => {
              onClose();
              alert(
                "Your cause has been submitted! It will be reviewed within 24 hours."
              );
            }}
          >
            Submit Cause →
          </button>
          <button className="btn-secondary" onClick={() => setStep(2)}>
            ← Back
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{STEP_TITLES[step]}</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {renderStepTrack()}
          {renderBody()}
        </div>
      </div>
    </div>
  );
}
