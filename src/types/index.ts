export type UserRole = "beneficiary" | "professional" | "volunteer";

export type ProfessionalSkill = 
  | "doctor" 
  | "engineer" 
  | "lawyer" 
  | "teacher" 
  | "government_servant" 
  | "other";

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  gender: "male" | "female" | "other";
  age: number;
  avatar_url: string;
  roles: UserRole[];
  is_verified: boolean;
  skills: ProfessionalSkill[];
  completed: boolean;
  created_at: string;
}

export type ProblemCategory = "public" | "disaster";

export type ProblemStatus = "pending" | "approved" | "rejected" | "completed";

export interface Problem {
  id: string;
  title: string;
  slug: string;
  story: string;
  images: string[];
  proof_documents: string[];
  amount_needed: number;
  amount_raised: number;
  donors_count: number;
  category: ProblemCategory;
  location: string;
  is_verified: boolean;
  verified_by: string | null;
  status: ProblemStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export type DonationStatus = "pending" | "completed" | "failed" | "refunded";

export interface Donation {
  id: string;
  problem_id: string;
  user_id: string;
  amount: number;
  payment_id: string;
  status: DonationStatus;
  created_at: string;
  profile?: Profile;
}

export interface ProblemUpdate {
  id: string;
  problem_id: string;
  message: string;
  images: string[];
  created_by: string;
  created_at: string;
  profile?: Profile;
}

export type HelperRole = "professional" | "volunteer";

export type ContributionType = "financial" | "skills" | "time" | "materials";

export interface ProblemHelper {
  problem_id: string;
  profile_id: string;
  role: HelperRole;
  contribution_type: ContributionType;
  created_at: string;
  profile?: Profile;
}

export interface ProblemReview {
  id: string;
  problem_id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profile?: Profile;
}

export interface DisasterChat {
  id: string;
  problem_id: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  disaster_chat_id: string;
  user_id: string;
  message: string;
  encrypted: boolean;
  created_at: string;
  profile?: Profile;
}
