import { useState } from "react";

interface ChatMessage {
  me: boolean;
  sender: string;
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    me: false,
    sender: "Dr. Arun Menon",
    text: "Medical team has reached sector 4. Triage station is set up.",
    time: "2:14 PM",
  },
  {
    me: false,
    sender: "Eng. Suresh R.",
    text: "Road to sector 7 is now clear. 2 JCBs in position for debris removal.",
    time: "2:18 PM",
  },
  {
    me: false,
    sender: "Adv. Priya N.",
    text: "Legal docs for displaced families are ready — uploading to shared drive now.",
    time: "2:22 PM",
  },
  {
    me: true,
    sender: "You",
    text: "Coordinating with logistics team. Supply truck ETA is 45 minutes to sector 4.",
    time: "2:25 PM",
  },
  {
    me: false,
    sender: "Volunteer Raj",
    text: "50 food packets and 30 water cans distributed in sector 2. Moving to sector 3.",
    time: "2:29 PM",
  },
  {
    me: false,
    sender: "Dr. Leela K.",
    text: "3 critical patients stabilised. Requesting one more ICU-trained nurse if available.",
    time: "2:33 PM",
  },
];

interface Team {
  color: string;
  name: string;
  members: string;
}

const TEAMS: Team[] = [
  { color: "#1a9e6e", name: "Medical Response", members: "Dr. Arun Menon + 6 doctors · 3 paramedics" },
  { color: "#f59e0b", name: "Structural Assessment", members: "4 civil engineers · 2 architects" },
  { color: "#3b82f6", name: "Legal Aid & Documentation", members: "Adv. Priya Nair + 3 lawyers" },
  { color: "#8b5cf6", name: "Supply & Logistics", members: "22 volunteers · 4 drivers" },
];

export function DisasterScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [joinedTeams, setJoinedTeams] = useState<Set<number>>(new Set());

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    const now = new Date();
    const time =
      now.getHours() + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();
    setMessages([...messages, { me: true, sender: "You", text: inputValue.trim(), time }]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  const mobilize = () => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const joinTeam = (index: number) => {
    setJoinedTeams((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="disaster-layout">
      <div className="disaster-main">
        <div className="disaster-header">
          <h2>
            <span className="ldot"></span> Wayanad Landslide Relief — Live Room
          </h2>
          <p>
            Kerala, India · Activated 3 days ago · Emergency response in progress · 142
            responders active
          </p>
        </div>
        <div className="disaster-body">
          <div className="d-stats">
            <div className="d-stat">
              <div className="d-val green">₹12.4L</div>
              <div className="d-lbl">Pooled Funds</div>
            </div>
            <div className="d-stat">
              <div className="d-val red">847</div>
              <div className="d-lbl">Displaced</div>
            </div>
            <div className="d-stat">
              <div className="d-val orange">142</div>
              <div className="d-lbl">Responders</div>
            </div>
          </div>

          <div className="updates-ticker">
            <span>📢</span>
            <span>
              <strong>Live:</strong> Medical team reached sector 4 — triage setup complete.
              Roads to sector 7 now clear.
            </span>
          </div>

          <div className={`mob-alert ${showAlert ? "show" : ""}`} id="mob-alert">
            📡 Alert sent to 23 verified doctors and 12 engineers within 50 km radius.
            Estimated response time: 40 min.
          </div>
          <button className="mob-btn" onClick={mobilize}>
            🚨 Mobilize Nearby Professionals
          </button>

          <div className="pool-box">
            <div className="pool-title">Collective Donation Pool</div>
            <div className="progress-bar" style={{ height: "8px" }}>
              <div className="progress-fill" style={{ width: "72%" }}></div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "var(--t2)",
                marginTop: "6px",
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--t)" }}>₹12.4L raised</span>
              <span>Goal: ₹17.2L (72%)</span>
            </div>
            <button
              className="btn-big"
              style={{ marginTop: "14px", marginBottom: 0 }}
              onClick={() => window.dispatchEvent(new CustomEvent("openDonateModal"))}
            >
              Donate to Relief Fund
            </button>
          </div>

          <div className="teams-box">
            <div className="teams-title">Active Sub-Teams</div>
            {TEAMS.map((team, index) => (
              <div key={team.name} className="team-row">
                <div className="team-info">
                  <div className="team-dot-c" style={{ background: team.color }}></div>
                  <div>
                    <div className="team-name">{team.name}</div>
                    <div className="team-members">{team.members}</div>
                  </div>
                </div>
                <button
                  className={`btn-join-team ${joinedTeams.has(index) ? "joined" : ""}`}
                  onClick={() => joinTeam(index)}
                >
                  {joinedTeams.has(index) ? "✓ Joined" : "Join"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chat-panel">
        <div className="chat-header">
          <h3>
            <span className="ldot"></span> Live Community Chat
          </h3>
          <p>🔒 End-to-end encrypted · 142 members active</p>
        </div>
        <div className="chat-messages" id="chat-msgs">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.me ? "me" : ""}`}>
              {!msg.me && <div className="chat-sender">{msg.sender}</div>}
              <div className="chat-bubble">{msg.text}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div className="chat-time">{msg.time}</div>
                <div className="enc-badge">🔒 encrypted</div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input-row">
          <input
            className="chat-input"
            placeholder="Type a message…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="chat-send" onClick={sendMessage}>
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M2 12L12 7 2 2v4l7 1-7 1v4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
