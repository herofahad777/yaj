import { useState } from "react";

interface DonateModalProps {
  open: boolean;
  onClose: () => void;
}

const AMOUNT_CHIPS = [
  { label: "₹100", value: 100 },
  { label: "₹500", value: 500 },
  { label: "₹1,000", value: 1000 },
  { label: "₹2,500", value: 2500 },
  { label: "₹5,000", value: 5000 },
];

export function DonateModal({ open, onClose }: DonateModalProps) {
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("1000");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [escrowNotice, setEscrowNotice] = useState(false);

  if (!open) return null;

  const handleChipSelect = (value: number, el: HTMLButtonElement) => {
    setSelectedAmount(value);
    setCustomAmount(value.toString());
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("sel"));
    el.classList.add("sel");
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(parseInt(value) || 0);
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("sel"));
  };

  const handleSubmit = () => {
    const amount = parseInt(customAmount) || selectedAmount;
    if (!amount || amount < 1) {
      alert("Please enter a valid amount.");
      return;
    }
    setEscrowNotice(true);
    setTimeout(() => {
      setShowSuccess(true);
    }, 2000);
  };

  return (
    <div className="donate-overlay" onClick={onClose}>
      <div className="donate-box" onClick={(e) => e.stopPropagation()}>
        <div className="donate-header">
          <div>
            <h3>Make a Donation</h3>
            <p>100% reaches the cause</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,.2)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              cursor: "pointer",
              color: "#fff",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
        <div className="donate-body">
          {!showSuccess ? (
            <>
              {escrowNotice && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "var(--rad-sm)",
                    padding: "12px 14px",
                    marginBottom: "16px",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "16px" }}>🔒</span>
                    <strong style={{ color: "#166534" }}>Escrow Protection Active</strong>
                  </div>
                  <p style={{ color: "#166534", fontSize: "12px" }}>
                    Your money is held safely. It will only be released when:
                  </p>
                  <ul style={{ color: "#166534", fontSize: "12px", marginTop: "6px", paddingLeft: "20px" }}>
                    <li>Problem is resolved</li>
                    <li>Before → After proof uploaded</li>
                    <li>Impact receipt generated</li>
                  </ul>
                </div>
              )}

              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "var(--rad-sm)",
                  padding: "10px 12px",
                  marginBottom: "12px",
                  fontSize: "12px",
                  color: "#92400e",
                }}
              >
                ⚠️ ASHA Verified Problem • GPS Tagged • Direct Chat Available
              </div>

              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--t)", marginBottom: "8px" }}>
                Select Amount (₹)
              </div>
              <div className="amount-chips">
                {AMOUNT_CHIPS.map((chip) => (
                  <button
                    key={chip.value}
                    className={`chip ${selectedAmount === chip.value ? "sel" : ""}`}
                    onClick={(e) => handleChipSelect(chip.value, e.currentTarget)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <input
                className="custom-input"
                type="number"
                placeholder="Or enter custom amount (₹)"
                value={customAmount}
                onChange={(e) => handleCustomChange(e.target.value)}
              />
              <label className="anon-row">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />{" "}
                Donate anonymously
              </label>

              {!escrowNotice ? (
                <>
                  <button className="donate-submit" onClick={handleSubmit}>
                    Donate ₹{parseInt(customAmount) || selectedAmount}
                  </button>
                  <div className="rzp-note">
                    🔒 Secured by Razorpay · 80G Tax Benefits
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      animation: "pulse 1s infinite",
                    }}
                  >
                    ⏳
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--t2)", marginTop: "8px" }}>
                    Processing your donation...
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="donate-success show">
              <div className="ds-icon">🎉</div>
              <div className="ds-title">Thank you for your generosity!</div>
              <div className="ds-sub">
                Your donation of <strong>₹{parseInt(customAmount) || selectedAmount}</strong> has
                been received and held in escrow.
              </div>
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "var(--rad-sm)",
                  padding: "12px",
                  marginTop: "16px",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#166534", marginBottom: "6px" }}>
                  📋 What happens next?
                </div>
                <ol style={{ fontSize: "12px", color: "#166534", paddingLeft: "16px", lineHeight: 1.8 }}>
                  <li>Money held in secure escrow</li>
                  <li>Helper resolves the problem</li>
                  <li>Before → After proof uploaded</li>
                  <li>Money released to receiver</li>
                  <li><strong>You get Impact Receipt!</strong></li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
