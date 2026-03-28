// User Roles
export type UserRole = 
  | "person_in_need" 
  | "professional" 
  | "volunteer" 
  | "donor"
  | "asha_worker"
  | "ngo"
  | "government";

// Professional Skills
export type ProfessionalSkill = 
  | "doctor" 
  | "nurse"
  | "lawyer" 
  | "engineer" 
  | "teacher"
  | "social_worker"
  | "government_servant"
  | "paramedic"
  | "architect"
  | "other";

// Verification Status
export type VerificationStatus = 
  | "pending" 
  | "in_review" 
  | "verified" 
  | "rejected";

// Problem Categories
export type ProblemCategory = 
  | "water" 
  | "medical" 
  | "disaster" 
  | "food"
  | "shelter"
  | "education"
  | "legal"
  | "other";

// Problem Status
export type ProblemStatus = 
  | "reported" 
  | "verifying" 
  | "approved" 
  | "in_progress" 
  | "resolved" 
  | "rejected";

// Trust Score
export type TrustScore = "low" | "medium" | "high" | "verified";

// Profile Interface
export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  gender: "male" | "female" | "other";
  age: number;
  avatar_url: string;
  roles: UserRole[];
  skills: ProfessionalSkill[];
  is_verified: boolean;
  verification_status: VerificationStatus;
  is_asha_worker: boolean;
  verification_documents: string[];
  license_number?: string;
  verification_registry?: string; // NMC/Bar Council/Govt DB
  trust_score: TrustScore;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// Location with GPS
export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

// Problem Interface
export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: ProblemCategory;
  images: string[];
  proof_documents: string[];
  
  // Geo-tagging
  location: GeoLocation;
  location_name: string;
  
  // Funding
  amount_needed: number;
  amount_raised: number;
  donors_count: number;
  
  // Verification
  is_verified: boolean;
  verified_by: string | null;
  verification_type: "asha" | "ai" | "community" | null;
  trust_score: TrustScore;
  
  // Status
  status: ProblemStatus;
  
  // Media for tracking
  before_images: string[];
  progress_images: string[];
  after_images: string[];
  
  // Engagement
  helpers_count: number;
  volunteers_count: number;
  
  // Urgency
  urgency_level: "low" | "medium" | "high" | "critical";
  
  // Meta
  created_by: string;
  assigned_to?: string; // Professional helper
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  
  profile?: Profile;
}

// Donation with Escrow
export type DonationStatus = "pending" | "escrow" | "completed" | "failed" | "refunded";
export type EscrowStatus = "held" | "released" | "refunded";

export interface Donation {
  id: string;
  problem_id: string;
  user_id: string;
  amount: number;
  payment_id: string;
  status: DonationStatus;
  escrow_status: EscrowStatus;
  escrow_released_at?: string;
  created_at: string;
  profile?: Profile;
}

// Impact Receipt
export interface ImpactReceipt {
  id: string;
  donation_id: string;
  problem_id: string;
  donor_id: string;
  amount: number;
  before_image?: string;
  after_image?: string;
  impact_description: string;
  issued_at: string;
}

// Problem Updates
export interface ProblemUpdate {
  id: string;
  problem_id: string;
  message: string;
  images: string[];
  update_type: "progress" | "milestone" | "resolved";
  created_by: string;
  created_at: string;
  profile?: Profile;
}

// Helper Interface
export type HelperRole = "professional" | "volunteer" | "asha";

export type ContributionType = "financial" | "skills" | "time" | "materials" | "verification";

export interface ProblemHelper {
  id: string;
  problem_id: string;
  profile_id: string;
  role: HelperRole;
  contribution_type: ContributionType;
  status: "pending" | "accepted" | "completed";
  hours_spent?: number;
  proof_images?: string[];
  created_at: string;
  profile?: Profile;
}

// Reviews
export interface ProblemReview {
  id: string;
  problem_id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profile?: Profile;
}

// Direct Chat
export interface DirectChat {
  id: string;
  problem_id: string;
  participant_1: string; // Reporter (Person in Need)
  participant_2: string; // Helper (Professional/Volunteer)
  last_message_at: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  message_type: "text" | "image" | "location" | "document";
  encrypted: boolean;
  read: boolean;
  created_at: string;
  profile?: Profile;
}

// Disaster SOS
export type SOSStatus = "active" | "responding" | "resolved";

export interface DisasterSOS {
  id: string;
  location: GeoLocation;
  location_name: string;
  description: string;
  triggered_by: string;
  status: SOSStatus;
  affected_count?: number;
  responders_notified: number;
  responders_accepted: number;
  created_at: string;
  resolved_at?: string;
}

// NGO Interface
export interface NGO {
  id: string;
  name: string;
  registration_number: string;
  verified: boolean;
  service_areas: string[];
  contact_email: string;
  contact_phone: string;
  logo_url?: string;
}
