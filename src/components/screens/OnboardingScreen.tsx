import { useState } from "react";
import { useAuthStore } from "@/features/authStore";
import { supabase } from "@/lib/supabaseClient";

interface OnboardingScreenProps {
  onComplete?: () => void;
}

// ============================================
// CONFIGURATION: Easy to add new questions
// ============================================

// Step 1: Role Selection Options
const ROLE_OPTIONS = [
  { 
    value: "person_in_need", 
    emoji: "🆘", 
    label: "Person in Need", 
    description: "Report problems & seek help" 
  },
  { 
    value: "professional", 
    emoji: "🩺", 
    label: "Professional Helper", 
    description: "Doctor, Lawyer, Engineer..." 
  },
  { 
    value: "volunteer", 
    emoji: "🙋", 
    label: "Volunteer", 
    description: "Time & skills to give" 
  },
  { 
    value: "asha_worker", 
    emoji: "👩‍⚕️", 
    label: "ASHA Worker", 
    description: "Ground verification" 
  },
];

// Step 2: Professional Categories (shown if professional is selected)
const PROFESSIONAL_CATEGORIES = [
  { value: "doctor", emoji: "🩺", label: "Doctor" },
  { value: "nurse", emoji: "👩‍⚕️", label: "Nurse" },
  { value: "lawyer", emoji: "⚖️", label: "Lawyer" },
  { value: "engineer", emoji: "🏗️", label: "Engineer" },
  { value: "teacher", emoji: "📚", label: "Teacher" },
  { value: "social_worker", emoji: "🤝", label: "Social Worker" },
  { value: "government_servant", emoji: "🏛️", label: "Govt Servant" },
  { value: "paramedic", emoji: "🚑", label: "Paramedic" },
  { value: "mental_health", emoji: "🧠", label: "Mental Health" },
  { value: "other", emoji: "📋", label: "Other" },
];

// Step 3: General Questions
// ADD NEW QUESTIONS HERE - Just add a new object to this array
const GENERAL_QUESTIONS = [
  {
    id: "full_name",
    type: "text" as const,
    label: "Full Name",
    placeholder: "Your full name",
    required: true,
  },
  {
    id: "phone",
    type: "tel" as const,
    label: "Phone Number",
    placeholder: "+91 98765 43210",
    required: true,
  },
  {
    id: "age",
    type: "number" as const,
    label: "Age",
    placeholder: "Your age",
    required: true,
  },
  {
    id: "gender",
    type: "select" as const,
    label: "Gender",
    options: ["Male", "Female", "Other", "Prefer not to say"],
    required: true,
  },
  {
    id: "location",
    type: "text" as const,
    label: "City / Location",
    placeholder: "e.g., Mumbai, Maharashtra",
    required: false,
  },
  {
    id: "occupation",
    type: "text" as const,
    label: "Occupation",
    placeholder: "Your profession",
    required: false,
  },
];

// Volunteer-specific questions
const VOLUNTEER_QUESTIONS = [
  {
    id: "availability",
    type: "select" as const,
    label: "Availability",
    options: ["Weekdays", "Weekends", "Flexible", "On-call"],
    required: true,
  },
  {
    id: "preferred_causes",
    type: "multiselect" as const,
    label: "Preferred Causes",
    options: ["Medical", "Education", "Disaster Relief", "Legal Aid", "Elderly Care", "Child Welfare"],
    required: false,
  },
];

// ASHA-specific questions
const ASHA_QUESTIONS = [
  {
    id: "asha_id",
    type: "text" as const,
    label: "ASHA Worker ID",
    placeholder: "Your ASHA worker ID",
    required: true,
  },
  {
    id: "district",
    type: "text" as const,
    label: "District",
    placeholder: "Your working district",
    required: true,
  },
  {
    id: "health_sub_center",
    type: "text" as const,
    label: "Health Sub-Center",
    placeholder: "Your assigned HSC",
    required: false,
  },
];

// ============================================
// ONSBOARDING COMPONENT
// ============================================

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isProfessional, setIsProfessional] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [isASHA, setIsASHA] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Calculate total steps dynamically based on selections
  const totalSteps = 1 + // Role selection
    (selectedRoles.length > 0 ? 1 : 0) + // General questions
    (isProfessional ? 1 : 0) + // Professional category
    (isVolunteer ? 1 : 0) + // Volunteer questions
    (isASHA ? 1 : 0) + // ASHA questions
    1; // Photo + Complete

  // Role selection handlers
  const toggleRole = (value: string) => {
    setSelectedRoles((prev) => 
      prev.includes(value) 
        ? prev.filter((r) => r !== value) 
        : [...prev, value]
    );
    
    // Update role-specific flags
    setIsProfessional((prev) => value === "professional" ? true : prev);
    setIsVolunteer((prev) => value === "volunteer" ? true : prev);
    setIsASHA((prev) => value === "asha_worker" ? true : prev);
  };

  // Skill selection
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => 
      prev.includes(skill) 
        ? prev.filter((s) => s !== skill) 
        : [...prev, skill]
    );
  };

  // Form data handler
  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Navigation
  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  // Submit profile to Supabase
  const submitProfile = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const profileData = {
        id: user.id,
        full_name: formData.full_name || user.email?.split('@')[0],
        phone: formData.phone || "",
        age: parseInt(formData.age) || 0,
        gender: formData.gender?.toLowerCase() || "other",
        roles: selectedRoles,
        skills: selectedSkills,
        is_verified: false,
        verification_status: "pending",
        is_asha_worker: isASHA,
        completed: true,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(profileData);

      if (error) throw error;
      
      setSubmitted(true);
      setTimeout(() => onComplete?.(), 2000);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render progress bar
  const renderProgressBar = () => (
    <div className="step-track">
      {Array.from({ length: totalSteps + 1 }).map((_, i) => (
        <div 
          key={i} 
          className={`step-seg ${i <= currentStep ? "done" : ""}`}
        />
      ))}
    </div>
  );

  // ============================================
  // STEP: Role Selection (First Step)
  // ============================================
  const renderRoleStep = () => (
    <>
      <div className="ob-title">Choose Your Role 🎯</div>
      <div className="ob-sub">
        Select all that apply. You can change this later in your profile.
      </div>
      
      <div className="role-grid">
        {ROLE_OPTIONS.map((role) => (
          <div
            key={role.value}
            className={`role-card ${selectedRoles.includes(role.value) ? "sel" : ""}`}
            onClick={() => toggleRole(role.value)}
          >
            <div className="role-icon">{role.emoji}</div>
            <div className="role-name">{role.label}</div>
            <div className="role-desc">{role.description}</div>
          </div>
        ))}
      </div>

      <div className="ob-actions">
        <button 
          className="btn-primary" 
          onClick={nextStep}
          disabled={selectedRoles.length === 0}
        >
          Continue →
        </button>
      </div>
    </>
  );

  // ============================================
  // STEP: General Questions
  // ============================================
  const renderGeneralQuestionsStep = () => (
    <>
      <div className="ob-title">Tell Us About Yourself 👤</div>
      <div className="ob-sub">
        This helps us personalize your experience.
      </div>

      {GENERAL_QUESTIONS.map((question) => (
        <div key={question.id}>
          <label className="field-lbl">
            {question.label}
            {question.required && <span style={{ color: "red" }}> *</span>}
          </label>
          
          {question.type === "select" ? (
            <select
              className="select-inp"
              value={formData[question.id] || ""}
              onChange={(e) => updateFormData(question.id, e.target.value)}
            >
              <option value="">Select...</option>
              {question.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              className="field-inp"
              type={question.type}
              placeholder={question.placeholder}
              value={formData[question.id] || ""}
              onChange={(e) => updateFormData(question.id, e.target.value)}
            />
          )}
        </div>
      ))}

      <div className="ob-actions">
        <button 
          className="btn-primary" 
          onClick={nextStep}
        >
          Continue →
        </button>
        <button className="btn-secondary" onClick={prevStep}>
          ← Back
        </button>
      </div>
    </>
  );

  // ============================================
  // STEP: Professional Category (if professional selected)
  // ============================================
  const renderProfessionalStep = () => (
    <>
      <div className="ob-title">Your Profession 🩺</div>
      <div className="ob-sub">
        Select your professional category to get verified.
      </div>

      <div className="role-grid">
        {PROFESSIONAL_CATEGORIES.map((cat) => (
          <div
            key={cat.value}
            className={`role-card ${formData.professional_category === cat.value ? "sel" : ""}`}
            onClick={() => updateFormData("professional_category", cat.value)}
          >
            <div className="role-icon">{cat.emoji}</div>
            <div className="role-name">{cat.label}</div>
          </div>
        ))}
      </div>

      <label className="field-lbl">License / Registration Number (optional)</label>
      <input
        className="field-inp"
        placeholder="NMC / Bar Council / License No."
        value={formData.license_number || ""}
        onChange={(e) => updateFormData("license_number", e.target.value)}
      />

      <div className="ob-actions">
        <button className="btn-primary" onClick={nextStep}>
          Continue →
        </button>
        <button className="btn-secondary" onClick={prevStep}>
          ← Back
        </button>
      </div>
    </>
  );

  // ============================================
  // STEP: Volunteer Questions
  // ============================================
  const renderVolunteerStep = () => (
    <>
      <div className="ob-title">Volunteer Preferences 🙋</div>
      <div className="ob-sub">
        Help us match you with causes you care about.
      </div>

      {VOLUNTEER_QUESTIONS.map((question) => (
        <div key={question.id}>
          <label className="field-lbl">
            {question.label}
            {question.required && <span style={{ color: "red" }}> *</span>}
          </label>
          
          {question.type === "select" ? (
            <select
              className="select-inp"
              value={formData[question.id] || ""}
              onChange={(e) => updateFormData(question.id, e.target.value)}
            >
              <option value="">Select...</option>
              {question.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : question.type === "multiselect" ? (
            <div className="skill-tags">
              {question.options?.map((opt) => (
                <span
                  key={opt}
                  className={`skill-tag ${(formData[question.id] || []).includes(opt) ? "sel" : ""}`}
                  onClick={() => {
                    const current = formData[question.id] || [];
                    const updated = current.includes(opt)
                      ? current.filter((i: string) => i !== opt)
                      : [...current, opt];
                    updateFormData(question.id, updated);
                  }}
                >
                  {opt}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ))}

      <label className="field-lbl">Skills you can offer (optional)</label>
      <div className="skill-tags">
        {["Teaching", "Medical", "Logistics", "Cooking", "Driving", "Counseling", "IT", "Construction"].map((skill) => (
          <span
            key={skill}
            className={`skill-tag ${selectedSkills.includes(skill) ? "sel" : ""}`}
            onClick={() => toggleSkill(skill)}
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="ob-actions">
        <button className="btn-primary" onClick={nextStep}>
          Continue →
        </button>
        <button className="btn-secondary" onClick={prevStep}>
          ← Back
        </button>
      </div>
    </>
  );

  // ============================================
  // STEP: ASHA Worker Questions
  // ============================================
  const renderASHAStep = () => (
    <>
      <div className="ob-title">ASHA Worker Verification 👩‍⚕️</div>
      <div className="ob-sub">
        Complete your ASHA worker profile for ground verification.
      </div>

      {ASHA_QUESTIONS.map((question) => (
        <div key={question.id}>
          <label className="field-lbl">
            {question.label}
            {question.required && <span style={{ color: "red" }}> *</span>}
          </label>
          <input
            className="field-inp"
            type="text"
            placeholder={question.placeholder}
            value={formData[question.id] || ""}
            onChange={(e) => updateFormData(question.id, e.target.value)}
          />
        </div>
      ))}

      <div className="ob-actions">
        <button className="btn-primary" onClick={nextStep}>
          Continue →
        </button>
        <button className="btn-secondary" onClick={prevStep}>
          ← Back
        </button>
      </div>
    </>
  );

  // ============================================
  // STEP: Photo + Complete
  // ============================================
  const renderFinalStep = () => (
    <>
      <div className="ob-title">Add a Profile Photo 📸</div>
      <div className="ob-sub">
        Help the community recognise you. Builds trust with those who need help.
      </div>
      
      <div className="photo-upload">
        <div className="photo-circle">
          {formData.photo_emoji || "+"}
        </div>
        <div className="photo-hint">Tap to upload · JPG or PNG · Max 5MB</div>
      </div>

      <div className="summary-card" style={{
        background: "var(--gl)",
        padding: "16px",
        borderRadius: "12px",
        marginBottom: "16px"
      }}>
        <div style={{ fontWeight: "600", marginBottom: "8px" }}>Profile Summary</div>
        <div style={{ fontSize: "13px", color: "var(--t2)" }}>
          <div>Name: {formData.full_name || "Not set"}</div>
          <div>Phone: {formData.phone || "Not set"}</div>
          <div>Roles: {selectedRoles.join(", ")}</div>
          {isProfessional && <div>Profession: {formData.professional_category}</div>}
        </div>
      </div>

      <div className="ob-actions">
        <button 
          className="btn-primary" 
          onClick={submitProfile}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Complete Profile →"}
        </button>
        <button className="btn-secondary" onClick={prevStep}>
          ← Back
        </button>
      </div>
    </>
  );

  // ============================================
  // STEP: Success Screen
  // ============================================
  const renderSuccess = () => (
    <div className="success-screen">
      <div className="success-icon">🎉</div>
      <div className="success-title">Welcome to SEWA!</div>
      <div className="success-sub">
        Your profile is complete. You're now part of the SEWA community.
        <br /><br />
        <strong>What you can do:</strong>
        <br />• Report problems with GPS + photos
        <br />• Get verified as a professional
        <br />• Help others in need
        <br />• Trigger SOS in emergencies
      </div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  
  // Show success if submitted
  if (submitted) {
    return (
      <div className="onboard-wrap">
        <div className="onboard-card">
          {renderSuccess()}
        </div>
      </div>
    );
  }

  // Render current step
  let stepContent;
  let stepIndex = 0;

  // Step 0: Role Selection
  if (currentStep === stepIndex) {
    stepContent = renderRoleStep();
  }
  stepIndex++;

  // Step 1: General Questions
  if (currentStep === stepIndex && selectedRoles.length > 0) {
    stepContent = renderGeneralQuestionsStep();
  }
  stepIndex++;

  // Step 2: Professional (if selected)
  if (currentStep === stepIndex && isProfessional) {
    stepContent = renderProfessionalStep();
  }
  stepIndex++;

  // Step 3: Volunteer (if selected)
  if (currentStep === stepIndex && isVolunteer) {
    stepContent = renderVolunteerStep();
  }
  stepIndex++;

  // Step 4: ASHA (if selected)
  if (currentStep === stepIndex && isASHA) {
    stepContent = renderASHAStep();
  }
  stepIndex++;

  // Final Step: Photo + Complete
  if (currentStep === stepIndex) {
    stepContent = renderFinalStep();
  }

  return (
    <div className="onboard-wrap">
      <div className="onboard-card">
        {renderProgressBar()}
        {stepContent}
      </div>
    </div>
  );
}
