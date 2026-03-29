interface ProblemCardProps {
  id?: string;
  emoji?: string;
  title: string;
  raised: number;
  goal: number;
  donors: number;
  urgent?: boolean;
  verified?: boolean;
  live?: boolean;
  isDisaster?: boolean;
  category?: string;
  isVerifiedHelper?: boolean;
  onClick?: () => void;
  onDonate?: () => void;
  onJoin?: () => void;
  onRespond?: (problem: { id: string; title: string; emoji: string; category: string }) => void;
}

export function ProblemCard({
  id,
  emoji = "🧒",
  title,
  raised,
  goal,
  donors,
  urgent = false,
  verified = false,
  live: _live = false,
  isDisaster = false,
  category = "general",
  isVerifiedHelper = false,
  onClick,
  onDonate,
  onJoin,
  onRespond,
}: ProblemCardProps) {
  const pct = Math.min(Math.round((raised / goal) * 100), 100);

  const fmt = (n: number) => {
    if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
    if (n >= 1000) return "₹" + (n / 1000).toFixed(0) + "K";
    return "₹" + n;
  };

  return (
    <div className="card" onClick={onClick}>
      <div className="card-img">
        <span>{emoji}</span>
        {isDisaster ? (
          <span className="badge badge-live">
            <span className="ldot"></span>LIVE
          </span>
        ) : urgent ? (
          <span className="badge badge-urgent">Urgent</span>
        ) : null}
        {verified && <span className="badge badge-verified">✓ Sewa Verified</span>}
      </div>
      <div className="card-body">
        <div className="card-title">{title}</div>
        <div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }}></div>
          </div>
          <div className="progress-labels">
            <span className="progress-raised">{fmt(raised)} raised</span>
            <span>of {fmt(goal)}</span>
          </div>
        </div>
        <div className="card-footer">
          <span className="donor-count">
            <span className="heart">♥</span>
            {donors.toLocaleString("en-IN")} donors
          </span>
          {isDisaster ? (
            <button
              className="btn btn-outline-red"
              onClick={(e) => {
                e.stopPropagation();
                onJoin?.();
              }}
            >
              Join Room
            </button>
          ) : (
            <div style={{ display: "flex", gap: "6px" }}>
              {isVerifiedHelper && onRespond && (
                <button
                  className="btn"
                  style={{
                    background: "var(--b)",
                    color: "white",
                    border: "none",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRespond?.({ id: id || "", title, emoji: emoji || "🧒", category });
                  }}
                >
                  🤝 Respond
                </button>
              )}
              <button
                className="btn btn-green"
                onClick={(e) => {
                  e.stopPropagation();
                  onDonate?.();
                }}
              >
                Donate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
