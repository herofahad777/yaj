import { useState } from "react";
import { ProblemCard } from "@/components/common/ProblemCard";

interface PublicProblem {
  emoji: string;
  title: string;
  raised: number;
  goal: number;
  donors: number;
  urgent: boolean;
  verified: boolean;
  slug: string;
}

interface Disaster {
  emoji: string;
  title: string;
  raised: number;
  goal: number;
  donors: number;
  urgent: boolean;
  verified: boolean;
  live: boolean;
  slug: string;
}

const PUBLIC_DATA: PublicProblem[] = [
  {
    emoji: "🧒",
    title: "A Single Mother Is Fighting To Save Her Only Son From Rare Kidney Disease",
    raised: 285400,
    goal: 620000,
    donors: 312,
    urgent: true,
    verified: true,
    slug: "rohan-kidney",
  },
  {
    emoji: "👩‍🌾",
    title: "Widow Farmer Needs Help Rebuilding Her Farm After Floods Destroyed Everything She Had",
    raised: 42000,
    goal: 150000,
    donors: 87,
    urgent: false,
    verified: true,
    slug: "farmer-flood",
  },
  {
    emoji: "🏫",
    title: "Rural School in Rajasthan Lacks Toilets — 200 Girls Are at Risk of Dropping Out",
    raised: 98000,
    goal: 200000,
    donors: 201,
    urgent: false,
    verified: false,
    slug: "school-rajasthan",
  },
  {
    emoji: "👴",
    title: "Retired Headmaster's Cancer Treatment Halted — Family Cannot Afford Chemotherapy",
    raised: 315000,
    goal: 480000,
    donors: 458,
    urgent: true,
    verified: true,
    slug: "cancer-teacher",
  },
  {
    emoji: "🧑‍⚕️",
    title: "Young Burn Victim Needs 8 Surgeries — Government Hospital Waitlist Is 2 Years",
    raised: 67000,
    goal: 340000,
    donors: 134,
    urgent: true,
    verified: false,
    slug: "burn-victim",
  },
  {
    emoji: "🏠",
    title: "Family of 5 Living Under Tarpaulin After Their House Collapsed in Heavy Rains",
    raised: 22000,
    goal: 90000,
    donors: 56,
    urgent: false,
    verified: true,
    slug: "house-collapse",
  },
];

const DISASTER_DATA: Disaster[] = [
  {
    emoji: "🌊",
    title: "Wayanad Landslide — Emergency Rescue & Rehabilitation for 847 Displaced Families",
    raised: 1240000,
    goal: 1720000,
    donors: 2341,
    urgent: true,
    verified: true,
    live: true,
    slug: "wayanad",
  },
  {
    emoji: "🔥",
    title: "Uttarakhand Forest Fire — Emergency Relief for 12 Villages Cut Off From All Roads",
    raised: 560000,
    goal: 900000,
    donors: 1102,
    urgent: true,
    verified: true,
    live: true,
    slug: "uttarakhand-fire",
  },
  {
    emoji: "🌪️",
    title: "Cyclone Midhili — Coastal Odisha Rebuilding Homes and Livelihoods After Devastation",
    raised: 830000,
    goal: 2500000,
    donors: 1890,
    urgent: false,
    verified: true,
    live: true,
    slug: "cyclone-midhili",
  },
];

interface DashboardScreenProps {
  onShowDetail?: () => void;
  onShowDisaster?: () => void;
  onOpenDonate?: () => void;
}

export function DashboardScreen({ onShowDetail, onShowDisaster, onOpenDonate }: DashboardScreenProps) {
  const [currentTab, setCurrentTab] = useState<"public" | "disaster">("public");

  return (
    <>
      <div className="hero">
        <h1>A Network Built on Altruism</h1>
        <p>
          Connect professionals, volunteers & communities to solve real-world
          problems — instantly.
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
            <div className="lbl">Professionals</div>
          </div>
          <div className="hero-stat">
            <div className="val">847</div>
            <div className="lbl">Active Causes</div>
          </div>
        </div>
        <div className="tabs">
          <button
            className={`tab ${currentTab === "public" ? "active" : ""}`}
            onClick={() => setCurrentTab("public")}
          >
            Public Problems
          </button>
          <button
            className={`tab ${currentTab === "disaster" ? "active" : ""}`}
            onClick={() => setCurrentTab("disaster")}
          >
            <span className="ldot"></span>Live Disasters
          </button>
        </div>
      </div>
      <div className="cards-grid">
        {currentTab === "public"
          ? PUBLIC_DATA.map((p) => (
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
          : DISASTER_DATA.map((d) => (
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
            ))}
      </div>
    </>
  );
}
