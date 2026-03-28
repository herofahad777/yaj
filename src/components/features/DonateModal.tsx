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
    setShowSuccess(true);
  };

  return (
    <div className="donate-overlay" onClick={onClose}>
      <div className="donate-box" onClick={(e) => e.stopPropagation()}>
        <div className="donate-header">
          <div>
            <h3>Make a Donation</h3>
            <p>100% of your donation reaches the cause</p>
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
              <button className="donate-submit" onClick={handleSubmit}>
                Donate ₹{parseInt(customAmount) || selectedAmount}
              </button>
              <div className="rzp-note">🔒 Secured by Razorpay · 80G Tax Benefits</div>
            </>
          ) : (
            <div className="donate-success show">
              <div className="ds-icon">🎉</div>
              <div className="ds-title">Thank you for your generosity!</div>
              <div className="ds-sub">
                Your donation of ₹{parseInt(customAmount) || selectedAmount} has been
                received. You'll get a confirmation on your registered email with 80G
                receipt.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
