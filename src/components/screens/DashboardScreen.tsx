import { useState } from "react";
import { ProblemCard } from "@/components/common/ProblemCard";
import type { ProblemCategory } from "@/types";

interface Problem {
  emoji: string;
  title: string;
  raised: number;
  goal: number;
  donors: number;
  urgent: boolean;
  verified: boolean;
  category: ProblemCategory;
  verificationType?: "asha" | "ai" | "community";
  location: string;
  distance?: string;
  slug: string;
}

const PROBLEMS: Problem[] = [
  {
    emoji: "💧",
    title: "Water Crisis in Ramanujan Colony — 200 Families Without Water for 3 Days",
    raised: 45000,
    goal: 120000,
    donors: 89,
    urgent: true,
    verified: true,
    category: "water",
    verificationType: "asha",
    location: "Nashik, Maharashtra",
    distance: "2.3 km",
    slug: "water-nashik",
  },
  {
    emoji: "🏥",
    title: "A Single Mother Is Fighting To Save Her Only Son From Rare Kidney Disease",
    raised: 285400,
    goal: 620000,
    donors: 312,
    urgent: true,
    verified: true,
    category: "medical",
    verificationType: "asha",
    location: "Nashik, Maharashtra",
    slug: "rohan-kidney",
  },
  {
    emoji: "👩‍🌾",
    title: "Widow Farmer Needs Help Rebuilding Her Farm After Floods Destroyed Everything",
    raised: 42000,
    goal: 150000,
    donors: 87,
    urgent: false,
    verified: true,
    category: "other",
    verificationType: "community",
    location: "Solapur, Maharashtra",
    slug: "farmer-flood",
  },
  {
    emoji: "🍽️",
    title: "Mid-Day Meal Scheme Halted — 500 Children at Risk of Malnutrition",
    raised: 78000,
    goal: 200000,
    donors: 156,
    urgent: true,
    verified: true,
    category: "food",
    verificationType: "ai",
    location: "Gadchiroli, Maharashtra",
    distance: "5.1 km",
    slug: "midday-meal",
  },
  {
    emoji: "📚",
    title: "Rural School in Rajasthan Lacks Toilets — 200 Girls Are at Risk of Dropping Out",
    raised: 98000,
    goal: 200000,
    donors: 201,
    urgent: false,
    verified: false,
    category: "education",
    location: "Jaisalmer, Rajasthan",
    slug: "school-rajasthan",
  },
  {
    emoji: "🏠",
    title: "Family of 5 Living Under Tarpaulin After Their House Collapsed in Heavy Rains",
    raised: 22000,
    goal: 90000,
    donors: 56,
    urgent: false,
    verified: true,
    category: "shelter",
    verificationType: "asha",
    location: "Kolhapur, Maharashtra",
    slug: "house-collapse",
  },
];

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
  const [categoryFilter, setCategoryFilter] = useState<ProblemCategory | "all">("all");
  const [sortBy, setSortBy] = useState("urgency");

  const filteredProblems =
    categoryFilter === "all"
      ? PROBLEMS
      : PROBLEMS.filter((p) => p.category === categoryFilter);

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
              {filteredProblems.length} problems found
            </span>
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
                emoji={p.emoji}
                title={p.title}
                raised={p.raised}
                goal={p.goal}
                donors={p.donors}
                urgent={p.urgent}
                verified={p.verified}
                onClick={onShowDetail}
                onDonate={onOpenDonate}
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
    </>
  );
}
