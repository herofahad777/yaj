import { useState, useEffect } from "react";
import { ProblemCard } from "@/components/common/ProblemCard";
import { ProblemMap } from "@/components/common/ProblemMap";
import type { ProblemCategory } from "@/types";
import { supabase } from "@/lib/supabaseClient";

const getCategoryEmoji = (category: string): string => {
  const emojis: Record<string, string> = {
    medical: "🏥",
    water: "💧",
    food: "🍽️",
    shelter: "🏠",
    disaster: "🚨",
    education: "📚",
    legal: "⚖️",
    other: "📋",
    public: "📋",
  };
  return emojis[category] || "📋";
};

const DISASTERS = [
  {
    emoji: "🌊",
    title: "Wayanad Landslide — Emergency Rescue & Rehabilitation for 847 Displaced Families",
    raised: 1240000,
    goal: 1720000,
    donors: 2341,
    urgent: true,
    verified: true,
    live: true,
    location: "Kerala",
    slug: "wayanad",
  },
  {
    emoji: "🔥",
    title: "Uttarakhand Forest Fire — Emergency Relief for 12 Villages Cut Off",
    raised: 560000,
    goal: 900000,
    donors: 1102,
    urgent: true,
    verified: true,
    live: true,
    location: "Uttarakhand",
    slug: "uttarakhand-fire",
  },
];

const CATEGORY_FILTERS: { value: ProblemCategory | "all"; icon: string; label: string }[] = [
  { value: "all", icon: "📋", label: "All" },
  { value: "medical", icon: "🏥", label: "Medical" },
  { value: "water", icon: "💧", label: "Water" },
  { value: "food", icon: "🍽️", label: "Food" },
  { value: "shelter", icon: "🏠", label: "Shelter" },
  { value: "education", icon: "📚", label: "Education" },
  { value: "disaster", icon: "🚨", label: "Disaster" },
  { value: "legal", icon: "⚖️", label: "Legal" },
];

const SORT_OPTIONS = [
  { value: "urgency", label: "Urgency" },
  { value: "location", label: "Nearest First" },
  { value: "recent", label: "Most Recent" },
  { value: "funded", label: "Most Funded" },
];

interface DashboardScreenProps {
  onShowDetail?: () => void;
  onShowDisaster?: () => void;
  onOpenDonate?: () => void;
}

export function DashboardScreen({ onShowDetail, onShowDisaster, onOpenDonate }: DashboardScreenProps) {
  const [currentTab, setCurrentTab] = useState<"feed" | "disaster">("feed");
  const [viewMode, setViewMode] = useState<"feed" | "map">("feed");
  const [categoryFilter, setCategoryFilter] = useState<ProblemCategory | "all">("all");
  const [sortBy, setSortBy] = useState("urgency");
  const [dbProblems, setDbProblems] = useState<any[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(true);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setLoadingProblems(true);
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setDbProblems(data || []);
    } catch (err) {
      console.error("Error loading problems:", err);
    } finally {
      setLoadingProblems(false);
    }
  };

  // Convert database problems to display format
  const displayProblems = dbProblems.map((p) => ({
    slug: p.slug || p.id,
    emoji: getCategoryEmoji(p.category),
    title: p.title,
    raised: p.amount_raised || 0,
    goal: p.amount_needed || 0,
    donors: p.donors_count || 0,
    urgent: false,
    verified: p.is_verified || false,
    category: p.category,
    location: p.location || "",
  }));

  const filteredProblems =
    categoryFilter === "all"
      ? displayProblems
      : displayProblems.filter((p) => p.category === categoryFilter);

  return (
    <>
      <div className="hero">
        <h1>A Network Built on Altruism</h1>
        <p>
          Connect professionals, volunteers & communities — Report → Verify → Respond
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="val">4,21,000+</div>
            <div className="lbl">Lives Impacted</div>
          </div>
          <div className="hero-stat">
            <div className="val">₹38.4 Cr</div>
            <div className="lbl">Funds Mobilised</div>
          </div>
          <div className="hero-stat">
            <div className="val">12,800+</div>
            <div className="lbl">Verified Helpers</div>
          </div>
          <div className="hero-stat">
            <div className="val">2,340</div>
            <div className="lbl">Problems Resolved</div>
          </div>
        </div>
        <div className="tabs">
          <button
            className={`tab ${currentTab === "feed" ? "active" : ""}`}
            onClick={() => setCurrentTab("feed")}
          >
            📋 Problem Feed
          </button>
          <button
            className={`tab ${currentTab === "disaster" ? "active" : ""}`}
            onClick={() => setCurrentTab("disaster")}
          >
            <span className="ldot"></span>Live Disasters
          </button>
        </div>
      </div>

      {currentTab === "feed" && (
        <div style={{ padding: "1rem 1.5rem 0", background: "#fff", borderBottom: "1px solid var(--bd)" }}>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px" }}>
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                className={`btn ${categoryFilter === filter.value ? "btn-green" : ""}`}
                style={{
                  background: categoryFilter === filter.value ? "var(--g)" : "var(--bg)",
                  color: categoryFilter === filter.value ? "#fff" : "var(--t2)",
                  padding: "6px 12px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                }}
                onClick={() => setCategoryFilter(filter.value)}
              >
                {filter.icon} {filter.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px" }}>
            <span style={{ fontSize: "12px", color: "var(--t2)" }}>
              {loadingProblems ? "Loading..." : `${filteredProblems.length} problems found`}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px" }}>
            <select
              style={{
                border: "none",
                background: "var(--bg)",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "12px",
                color: "var(--t2)",
                cursor: "pointer",
              }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {currentTab === "feed" && (
        <div style={{ padding: "0 1.5rem", background: "#fff", borderBottom: "1px solid var(--bd)" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              className={`btn ${viewMode === "feed" ? "btn-green" : ""}`}
              style={{
                background: viewMode === "feed" ? "var(--g)" : "var(--bg)",
                color: viewMode === "feed" ? "#fff" : "var(--t2)",
                padding: "6px 12px",
                fontSize: "12px",
              }}
              onClick={() => setViewMode("feed")}
            >
              📋 Feed
            </button>
            <button
              className={`btn ${viewMode === "map" ? "btn-green" : ""}`}
              style={{
                background: viewMode === "map" ? "var(--g)" : "var(--bg)",
                color: viewMode === "map" ? "#fff" : "var(--t2)",
                padding: "6px 12px",
                fontSize: "12px",
              }}
              onClick={() => setViewMode("map")}
            >
              🗺️ Map
            </button>
          </div>
        </div>
      )}

      {currentTab === "feed" && viewMode === "map" ? (
        <ProblemMap
          problems={filteredProblems}
          onProblemClick={() => onShowDetail?.()}
        />
      ) : (
      <div className="cards-grid">
          {currentTab === "feed" ? (
            filteredProblems.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem", color: "var(--t2)" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
                <div style={{ fontWeight: "600" }}>No problems found</div>
                <div style={{ fontSize: "13px", marginTop: "4px" }}>Try a different category</div>
              </div>
            ) : (
              filteredProblems.map((p) => (
                <ProblemCard
                  key={p.slug}
                  id={p.slug}
                  emoji={p.emoji}
                  title={p.title}
                  raised={p.raised}
                  goal={p.goal}
                  donors={p.donors}
                  urgent={p.urgent}
                  verified={p.verified}
                  category={p.category}
                  isVerifiedHelper={true}
                  onClick={onShowDetail}
                  onDonate={onOpenDonate}
                  onRespond={(problem) => {
                    window.dispatchEvent(new CustomEvent("openResponseModal", { detail: problem }));
                  }}
                />
              ))
            )
          ) : (
            DISASTERS.map((d) => (
              <ProblemCard
                key={d.slug}
                emoji={d.emoji}
                title={d.title}
                raised={d.raised}
                goal={d.goal}
                donors={d.donors}
                urgent={d.urgent}
                verified={d.verified}
                live={d.live}
                isDisaster
                onClick={onShowDisaster}
                onJoin={onShowDisaster}
              />
            ))
          )}
        </div>
      )}
    </>
  );
}
