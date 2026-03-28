import { DirectChat } from "@/components/features/DirectChat";

interface Helper {
  i: string;
  c: string;
  n: string;
  r: string;
}

const HELPERS: Helper[] = [
  { i: "AM", c: "#1a9e6e", n: "Dr. Arun Menon", r: "Nephrologist" },
  { i: "LK", c: "#3b82f6", n: "Dr. Leela K.", r: "Paediatric Surgeon" },
  { i: "RP", c: "#8b5cf6", n: "Adv. Raj Patel", r: "Legal Aid" },
  { i: "SM", c: "#f59e0b", n: "Suresh M.", r: "Social Worker" },
];

interface DetailScreenProps {
  onBack?: () => void;
  onOpenDonate?: () => void;
}

export function DetailScreen({ onBack, onOpenDonate }: DetailScreenProps) {
  return (
    <>
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <span style={{ fontSize: "13px", color: "var(--t2)" }}>/ Problem Detail</span>
      </div>
      <div className="detail-hero">💧</div>
      <div className="detail-layout">
        <div className="detail-main">
          <div className="badge-row">
            <span className="pill pill-green" style={{ background: "#dcfce7", color: "#166534" }}>
              ✓ ASHA Verified
            </span>
            <span className="pill" style={{ background: "#fef3c7", color: "#92400e" }}>
              🤖 AI Cross-Checked
            </span>
            <span className="pill pill-red">🚨 Urgent</span>
            <span className="pill pill-blue">💧 Water Crisis</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                background: "var(--gl)",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                color: "var(--gd)",
              }}
            >
              📍 Nashik, Maharashtra
            </span>
            <span
              style={{
                background: "#f3f4f6",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                color: "var(--t2)",
              }}
            >
              🏠 Rural Area
            </span>
          </div>

          <h2>Water Crisis in Ramanujan Colony — 200 Families Without Water for 3 Days</h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "16px",
              padding: "10px 14px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "var(--rad-sm)",
            }}
          >
            <span style={{ fontSize: "16px" }}>👤</span>
            <span style={{ fontSize: "13px", color: "#92400e" }}>
              Reported by <strong>Smt. Kavita Deshmukh</strong> (ASHA Worker) — 2 hours ago
            </span>
          </div>

          <div className="story">
            <p>
              Ramanujan Colony, a semi-urban settlement in Nashik district, has been without
              municipal water supply for the past 3 days. The underground pipeline burst during
              the recent road construction work, and the repair has been delayed.
            </p>
            <p>
              200 families, including 45 children under 5 years and 12 elderly residents, are
              severely affected. Women walk 2 km daily to fetch water from a polluted stream,
              risking waterborne diseases.
            </p>
            <p>
              An ASHA worker from the colony reported this issue. Local plumber estimates pipe
              repair will take 5-7 days and cost approximately ₹1,20,000 for materials and
              labor.
            </p>
          </div>

          <div className="section-title">Impact Timeline</div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <div
              style={{
                flex: 1,
                textAlign: "center",
                padding: "12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "var(--rad-sm)",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>📷</div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--t)" }}>Before</div>
              <div style={{ fontSize: "11px", color: "var(--t3)" }}>Problem reported</div>
            </div>
            <div
              style={{
                flex: 1,
                textAlign: "center",
                padding: "12px",
                background: "#fef9c3",
                border: "1px solid #fef08a",
                borderRadius: "var(--rad-sm)",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>🔄</div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--t)" }}>Progress</div>
              <div style={{ fontSize: "11px", color: "var(--t3)" }}>Repair in progress</div>
            </div>
            <div
              style={{
                flex: 1,
                textAlign: "center",
                padding: "12px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "var(--rad-sm)",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>✅</div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--t)" }}>After</div>
              <div style={{ fontSize: "11px", color: "var(--t3)" }}>Water restored</div>
            </div>
          </div>

          <div className="section-title">What Is Needed</div>
          <ul className="needs-list">
            <li>₹80,000 for PVC pipeline materials (100 meters)</li>
            <li>₹25,000 for professional plumber and helper wages</li>
            <li>₹15,000 for emergency water tankers (temporary supply)</li>
          </ul>

          <div className="section-title">Direct Chat with Reporter</div>
          <div style={{ marginBottom: "16px" }}>
            <DirectChat
              chatId="water-crisis-1"
              participantName="Kavita Deshmukh"
              participantRole="ASHA Worker"
            />
          </div>

          <div className="section-title">Who Has Helped (6 people)</div>
          <div className="helpers-wrap">
            {HELPERS.map((h) => (
              <div key={h.i} className="helper-chip">
                <div className="ha" style={{ background: h.c }}>
                  {h.i}
                </div>
                <div>
                  <div className="hn">{h.n}</div>
                  <div className="hr">{h.r}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-card">
            <div className="sidebar-amount">₹45,000</div>
            <div className="sidebar-goal">raised of ₹1,20,000 goal</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "37%" }}></div>
            </div>
            <div className="sidebar-pct">37% funded</div>

            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "var(--rad-sm)",
                padding: "10px 12px",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <span style={{ fontSize: "14px" }}>🔒</span>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#166534" }}>
                  Escrow Protected
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "#166534" }}>
                Money released only when problem is resolved + proof uploaded
              </p>
            </div>

            <div className="sidebar-stats">
              <div className="stat">
                <div className="stat-val">89</div>
                <div className="stat-lbl">Donors</div>
              </div>
              <div className="stat">
                <div className="stat-val">5</div>
                <div className="stat-lbl">Days Left</div>
              </div>
              <div className="stat">
                <div className="stat-val">2</div>
                <div className="stat-lbl">Professionals</div>
              </div>
              <div className="stat">
                <div className="stat-val">4</div>
                <div className="stat-lbl">Volunteers</div>
              </div>
            </div>

            <button className="btn-big" onClick={onOpenDonate}>
              Donate Now
            </button>
            <div className="tax-note">🛡 80G Tax Benefits · Escrow Protected</div>
          </div>

          <div className="sidebar-card">
            <div
              style={{
                fontFamily: "var(--font)",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              Help Without Money
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "var(--t2)",
                lineHeight: 1.6,
                marginBottom: "12px",
              }}
            >
              Can't donate? Share your skills instead.
            </p>
            <button
              className="btn"
              style={{
                width: "100%",
                background: "var(--gl)",
                color: "var(--gd)",
                border: "1.5px solid var(--gm)",
                fontSize: "13px",
                fontWeight: 600,
                padding: "10px",
                borderRadius: "var(--rad-sm)",
                marginBottom: "8px",
              }}
            >
              🔧 Offer Plumbing Help
            </button>
            <button
              className="btn"
              style={{
                width: "100%",
                background: "var(--bg)",
                color: "var(--t2)",
                border: "1.5px solid var(--bd)",
                fontSize: "13px",
                fontWeight: 500,
                padding: "10px",
                borderRadius: "var(--rad-sm)",
              }}
            >
              📤 Share Problem
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
