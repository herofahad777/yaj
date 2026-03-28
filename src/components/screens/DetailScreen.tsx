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
  { i: "PK", c: "#1a9e6e", n: "Dr. Priya K.", r: "Cardiologist" },
  { i: "VN", c: "#ef4444", n: "Vikram N.", r: "Volunteer" },
  { i: "AG", c: "#3b82f6", n: "Anjali G.", r: "Volunteer" },
  { i: "MR", c: "#8b5cf6", n: "Mohan R.", r: "Engineer" },
  { i: "SK", c: "#f59e0b", n: "Sneha K.", r: "Teacher" },
  { i: "AR", c: "#1a9e6e", n: "Arjun R.", r: "Doctor" },
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
      <div className="detail-hero">🧒</div>
      <div className="detail-layout">
        <div className="detail-main">
          <div className="badge-row">
            <span className="pill pill-green">✓ Yuj Verified</span>
            <span className="pill pill-red">🚨 Urgent</span>
            <span className="pill pill-blue">🏥 Medical</span>
            <span className="pill" style={{ background: "#f5f3ff", color: "#6d28d9" }}>
              Maharashtra
            </span>
          </div>
          <h2>
            A Single Mother Is Fighting To Save Her Only Son From Rare Kidney Disease
          </h2>
          <div className="story">
            <p>
              Priya Sharma, 34, a daily wage worker from Nashik, has been fighting alone
              for 18 months to save her 8-year-old son Rohan, diagnosed with a rare form
              of nephrotic syndrome. Her husband passed away two years ago, leaving her as
              the sole provider.
            </p>
            <p>
              Rohan requires a kidney transplant within the next 90 days or the damage
              becomes irreversible. The total cost of the procedure and post-operative care
              is ₹6,20,000. Priya earns only ₹8,000 per month and has already exhausted
              her savings and sold her jewellery.
            </p>
            <p>
              Two nephrologists from Yuj's verified professional network — Dr. Arun Menon
              and Dr. Leela Krishnan — have reviewed the case and confirmed the urgency. A
              donor kidney match has already been found. The only remaining barrier is
              funding.
            </p>
          </div>

          <div className="section-title">What Is Needed</div>
          <ul className="needs-list">
            <li>₹4,20,000 for kidney transplant surgery at Kokilaben Hospital</li>
            <li>₹1,20,000 for post-operative immunosuppressant medication (1 year)</li>
            <li>₹80,000 for hospital stay, physiotherapy & follow-up care</li>
            <li>Legal assistance for medical insurance claims</li>
          </ul>

          <div className="section-title">Recent Updates</div>
          <div className="update-list">
            <div className="update-item">
              <div className="update-line">
                <div className="update-dot"></div>
                <div className="update-stem"></div>
              </div>
              <div className="update-content">
                <div className="update-text">
                  Dr. Arun Menon confirmed donor kidney compatibility. Surgery now
                  scheduled pending full funding.
                </div>
                <div className="update-time">2 hours ago · by Dr. Arun Menon</div>
              </div>
            </div>
            <div className="update-item">
              <div className="update-line">
                <div className="update-dot"></div>
                <div className="update-stem"></div>
              </div>
              <div className="update-content">
                <div className="update-text">
                  ₹1,85,000 raised overnight after Yuj featured this cause on the
                  homepage. Priya broke down in tears of gratitude.
                </div>
                <div className="update-time">Yesterday, 9:14 PM</div>
              </div>
            </div>
            <div className="update-item">
              <div className="update-line">
                <div className="update-dot"></div>
              </div>
              <div className="update-content">
                <div className="update-text">
                  Advocate Raj Patel helped Priya file for government medical assistance —
                  application submitted to District Collector's office.
                </div>
                <div className="update-time">3 days ago</div>
              </div>
            </div>
          </div>

          <div className="section-title">Who Has Helped (41 people)</div>
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
            <div className="sidebar-amount">₹2,85,400</div>
            <div className="sidebar-goal">raised of ₹6,20,000 goal</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "46%" }}></div>
            </div>
            <div className="sidebar-pct">46% funded</div>
            <div className="sidebar-stats">
              <div className="stat">
                <div className="stat-val">312</div>
                <div className="stat-lbl">Donors</div>
              </div>
              <div className="stat">
                <div className="stat-val">88</div>
                <div className="stat-lbl">Days Left</div>
              </div>
              <div className="stat">
                <div className="stat-val">14</div>
                <div className="stat-lbl">Professionals</div>
              </div>
              <div className="stat">
                <div className="stat-val">27</div>
                <div className="stat-lbl">Volunteers</div>
              </div>
            </div>
            <div className="toast" id="donate-toast">
              🎉 Thank you! Your donation is confirmed.
            </div>
            <button className="btn-big" onClick={onOpenDonate}>
              Donate Now
            </button>
            <div className="tax-note">🛡 80G Tax Benefits · Yuj Verified</div>
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
              Join as Helper
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "var(--t2)",
                lineHeight: 1.6,
                marginBottom: "12px",
              }}
            >
              Are you a doctor, lawyer, engineer or social worker? Your expertise can
              change this family's life.
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
              }}
              onClick={() => alert("Joining as professional helper…")}
            >
              + Join as Professional Helper
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
