import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types";

interface DirectChatProps {
  chatId: string;
  participantName: string;
  participantRole: string;
  onClose?: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    chat_id: "1",
    sender_id: "other",
    message: "Hello! I saw your problem report. I'm here to help.",
    message_type: "text",
    encrypted: true,
    read: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    chat_id: "1",
    sender_id: "me",
    message: "Thank you so much! The water situation is getting worse.",
    message_type: "text",
    encrypted: true,
    read: true,
    created_at: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: "3",
    chat_id: "1",
    sender_id: "other",
    message: "I understand. I've informed the nearest NGO and they're coordinating a water tanker. ETA 2 hours.",
    message_type: "text",
    encrypted: true,
    read: true,
    created_at: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: "4",
    chat_id: "1",
    sender_id: "other",
    message: "📍 Sending you the live location of the water tanker",
    message_type: "location",
    encrypted: true,
    read: true,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

export function DirectChat({ chatId, participantName, participantRole, onClose }: DirectChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      chat_id: chatId,
      sender_id: "me",
      message: inputValue.trim(),
      message_type: "text",
      encrypted: true,
      read: false,
      created_at: new Date().toISOString(),
    };
    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-panel" style={{ border: "none", borderRadius: "var(--rad)", overflow: "hidden" }}>
      <div className="chat-header" style={{ background: "var(--gl)", borderColor: "var(--gm)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--g)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#fff",
                }}
              >
                {participantName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              {participantName}
            </h3>
            <p style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "var(--g)", fontSize: "11px", fontWeight: "600" }}>
                ✓ {participantRole}
              </span>
              <span style={{ fontSize: "11px" }}>• Direct Chat (Encrypted)</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn"
              style={{
                padding: "6px 12px",
                fontSize: "11px",
                background: "var(--wh)",
                border: "1px solid var(--gm)",
                color: "var(--gd)",
              }}
              onClick={() => setShowVerification(!showVerification)}
            >
              {showVerification ? "Hide" : "Show"} Proof
            </button>
            {onClose && (
              <button
                className="close-btn"
                onClick={onClose}
                style={{ background: "var(--wh)" }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {showVerification && (
        <div
          style={{
            padding: "12px 14px",
            background: "var(--gl)",
            borderBottom: "1px solid var(--gm)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px", color: "var(--gd)" }}>
            📸 Verification Timeline
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  width: "100%",
                  height: "60px",
                  background: "#f3f4f6",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "4px",
                }}
              >
                📷
              </div>
              <div style={{ fontSize: "10px", color: "var(--t3)" }}>Before</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  width: "100%",
                  height: "60px",
                  background: "#f3f4f6",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "4px",
                }}
              >
                🔄
              </div>
              <div style={{ fontSize: "10px", color: "var(--t3)" }}>Progress</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  width: "100%",
                  height: "60px",
                  background: "#f3f4f6",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "4px",
                }}
              >
                ✅
              </div>
              <div style={{ fontSize: "10px", color: "var(--t3)" }}>After</div>
            </div>
          </div>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg ${msg.sender_id === "me" ? "me" : ""}`}>
            {msg.sender_id !== "me" && (
              <div className="chat-sender">{participantName}</div>
            )}
            <div className="chat-bubble">
              {msg.message_type === "location" ? (
                <span style={{ fontSize: "16px" }}>{msg.message}</span>
              ) : (
                msg.message
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div className="chat-time">{formatTime(msg.created_at)}</div>
              <div className="enc-badge">🔒</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
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
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M2 12L12 7 2 2v4l7 1-7 1v4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
