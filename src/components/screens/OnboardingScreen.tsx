import { useState } from "react";

interface Role {
  v: string;
  i: string;
  n: string;
  d: string;
}

const ROLES: Role[] = [
  { v: "person_in_need", i: "🆘", n: "Person in Need", d: "Report problems & seek help" },
  { v: "professional", i: "🩺", n: "Professional Helper", d: "Doctor, Lawyer, Engineer..." },
  { v: "volunteer", i: "🙋", n: "Volunteer", d: "Time & skills to give" },
  { v: "asha_worker", i: "👩‍⚕️", n: "ASHA Worker", d: "Ground verification" },
];

const SKILLS = [
  "Medicine",
  "Law",
  "Civil Engineering",
  "Education",
  "Social Work",
  "Govt Affairs",
  "Mental Health",
  "IT & Tech",
  "Logistics",
  "Finance",
];

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [photoEmoji, setPhotoEmoji] = useState<string | null>(null);

  const toggleRole = (v: string) => {
    setSelectedRoles((prev) =>
      prev.includes(v) ? prev.filter((r) => r !== v) : [...prev, v]
    );
  };

  const toggleSkill = (s: string) => {
    setSelectedSkills((prev) =>
      prev.includes(s) ? prev.filter((sk) => sk !== s) : [...prev, s]
    );
  };

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const renderStepTrack = () => (
    <div className="step-track">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`step-seg ${i <= step ? "done" : ""}`}></div>
      ))}
    </div>
  );

  const renderBody = () => {
    if (step === 0) {
      return (
        <>
          <div className="ob-title">Welcome to SEWA 👋</div>
          <div className="ob-sub">
            A platform connecting those in need with helpers — Report → Verify → Respond.
            <br />
            Set up your profile in 4 steps.
          </div>
          <label className="field-lbl">Full Name</label>
          <input
            className="field-inp"
            placeholder="Your full name"
            defaultValue="Priya Sharma"
          />
          <div className="field-row">
            <div>
              <label className="field-lbl">Age</label>
              <input className="field-inp" type="number" placeholder="Age" defaultValue="34" />
            </div>
            <div>
              <label className="field-lbl">Gender</label>
              <select className="select-inp">
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
          </div>
          <label className="field-lbl">Phone Number</label>
          <input
            className="field-inp"
            placeholder="+91 98765 43210"
            defaultValue="+91 98765 43210"
          />
          <div className="ob-actions">
            <button className="btn-primary" onClick={next}>
              Continue →
            </button>
          </div>
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <div className="ob-title">Choose Your Role</div>
          <div className="ob-sub">Select all that apply. You can update this later.</div>
          <div className="role-grid">
            {ROLES.map((r) => (
              <div
                key={r.v}
                className={`role-card ${selectedRoles.includes(r.v) ? "sel" : ""}`}
                onClick={() => toggleRole(r.v)}
              >
                <div className="role-icon">{r.i}</div>
                <div className="role-name">{r.n}</div>
                <div className="role-desc">{r.d}</div>
              </div>
            ))}
          </div>
          <div className="ob-actions">
            <button className="btn-primary" onClick={next} disabled={selectedRoles.length === 0}>
              Continue →
            </button>
            <button className="btn-secondary" onClick={back}>
              ← Back
            </button>
          </div>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <div className="ob-title">Your Skills & Expertise</div>
          <div className="ob-sub">
            This helps match you with the right causes and people who need your help.
          </div>
          <div className="skill-tags">
            {SKILLS.map((s) => (
              <span
                key={s}
                className={`skill-tag ${selectedSkills.includes(s) ? "sel" : ""}`}
                onClick={() => toggleSkill(s)}
              >
                {s}
              </span>
            ))}
          </div>
          <label className="field-lbl">Professional License (optional)</label>
          <input className="field-inp" placeholder="NMC / Bar Council / License No." />
          <div className="ob-actions">
            <button className="btn-primary" onClick={next}>
              Continue →
            </button>
            <button className="btn-secondary" onClick={back}>
              ← Back
            </button>
          </div>
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <div className="ob-title">Add a Profile Photo</div>
          <div className="ob-sub">
            Help the community recognise you. Builds trust with those who need help.
          </div>
          <div className="photo-upload">
            <div className="photo-circle" onClick={() => setPhotoEmoji("👩")}>
              {photoEmoji || "+"}
            </div>
            <div className="photo-hint">Tap to upload · JPG or PNG · Max 5MB</div>
          </div>
          <div className="ob-actions">
            <button className="btn-primary" onClick={next}>
              Complete Profile →
            </button>
            <button className="btn-secondary" onClick={back}>
              ← Back
            </button>
          </div>
        </>
      );
    }

    return (
      <div className="success-screen">
        <div className="success-icon">🎉</div>
        <div className="success-title">Welcome to SEWA, Priya!</div>
        <div className="success-sub">
          Your profile is live. You're part of the Report → Verify → Respond pipeline.
          <br />
          <br />
          <strong>Report</strong> problems with GPS + photos
          <br />
          <strong>Verify</strong> with ASHA or AI cross-check
          <br />
          <strong>Respond</strong> with professionals & volunteers
        </div>
        <button className="btn-primary" onClick={onComplete}>
          Explore Feed →
        </button>
      </div>
    );
  };

  return (
    <div className="onboard-wrap">
      <div className="onboard-card">
        {renderStepTrack()}
        {renderBody()}
      </div>
    </div>
  );
}
