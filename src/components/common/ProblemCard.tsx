interface ProblemCardProps {
  emoji?: string;
  title: string;
  raised: number;
  goal: number;
  donors: number;
  urgent?: boolean;
  verified?: boolean;
  live?: boolean;
  isDisaster?: boolean;
  onClick?: () => void;
  onDonate?: () => void;
  onJoin?: () => void;
}

export function ProblemCard({
  emoji = "🧒",
  title,
  raised,
  goal,
  donors,
  urgent = false,
  verified = false,
  live: _live = false,
  isDisaster = false,
  onClick,
  onDonate,
  onJoin,
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
        {verified && <span className="badge badge-verified">✓ Yuj Verified</span>}
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
            <button
              className="btn btn-green"
              onClick={(e) => {
                e.stopPropagation();
                onDonate?.();
              }}
            >
              Donate Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
