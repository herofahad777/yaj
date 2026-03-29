import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ========================================
// AUTH FUNCTIONS
// ========================================

export async function signInWithGoogle() {
  const redirectUrl = import.meta.env.VITE_OAUTH_REDIRECT_URL || window.location.origin;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// ========================================
// VERIFICATION FUNCTIONS
// ========================================

interface VerificationRequest {
  id?: string;
  profile_id: string;
  full_name: string;
  profession: string;
  specialization?: string;
  license_number?: string;
  organization_name?: string;
  certificate_url?: string;
  id_proof_url?: string;
  status?: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at?: string;
}

export async function submitVerificationRequest(data: {
  profileId: string;
  fullName: string;
  profession: string;
  specialization?: string;
  licenseNumber?: string;
  organizationName?: string;
  certificateFile?: File;
  idProofFile?: File;
}): Promise<VerificationRequest> {
  const { profileId, fullName, profession, specialization, licenseNumber, organizationName, certificateFile, idProofFile } = data;
  
  let certificateUrl = '';
  let idProofUrl = '';

  // Upload certificate to storage
  if (certificateFile) {
    const certPath = `${profileId}/certificate_${Date.now()}_${certificateFile.name}`;
    const { error: certError } = await supabase.storage
      .from('verification_docs')
      .upload(certPath, certificateFile);
    
    if (certError) {
      console.error('Certificate upload error:', certError);
      throw new Error('Failed to upload certificate');
    }
    
    const { data: certUrlData } = supabase.storage
      .from('verification_docs')
      .getPublicUrl(certPath);
    certificateUrl = certUrlData.publicUrl;
  }

  // Upload ID proof to storage
  if (idProofFile) {
    const idPath = `${profileId}/idproof_${Date.now()}_${idProofFile.name}`;
    const { error: idError } = await supabase.storage
      .from('verification_docs')
      .upload(idPath, idProofFile);
    
    if (idError) {
      console.error('ID proof upload error:', idError);
      throw new Error('Failed to upload ID proof');
    }
    
    const { data: idUrlData } = supabase.storage
      .from('verification_docs')
      .getPublicUrl(idPath);
    idProofUrl = idUrlData.publicUrl;
  }

  // Save verification request to database
  const { data: request, error } = await supabase
    .from('helper_verification_requests')
    .insert({
      profile_id: profileId,
      full_name: fullName,
      profession,
      specialization: specialization || null,
      license_number: licenseNumber || null,
      organization_name: organizationName || null,
      certificate_url: certificateUrl || null,
      id_proof_url: idProofUrl || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return request;
}

export async function getVerificationStatus(profileId: string): Promise<VerificationRequest | null> {
  const { data, error } = await supabase
    .from('helper_verification_requests')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getMyVerificationRequest(profileId: string): Promise<VerificationRequest | null> {
  const { data, error } = await supabase
    .from('helper_verification_requests')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

// Admin functions
export async function getAllVerificationRequests(status?: 'pending' | 'approved' | 'rejected'): Promise<VerificationRequest[]> {
  let query = supabase
    .from('helper_verification_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function approveVerification(requestId: string, adminId: string): Promise<void> {
  // First get the request to find the profile_id
  const { data: request, error: fetchError } = await supabase
    .from('helper_verification_requests')
    .select('profile_id')
    .eq('id', requestId)
    .single();

  if (fetchError) throw fetchError;

  // Update the verification request status
  const { error } = await supabase
    .from('helper_verification_requests')
    .update({
      status: 'approved',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) throw error;

  // Also update the profile's is_verified to true (if column exists)
  if (request?.profile_id) {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', request.profile_id);

      if (profileError) {
        console.warn('is_verified column may not exist yet:', profileError.message);
      }
    } catch (e) {
      console.warn('Could not update is_verified - column may not exist');
    }
  }
}

export async function rejectVerification(requestId: string, reason: string, adminId: string): Promise<void> {
  const { error } = await supabase
    .from('helper_verification_requests')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) throw error;
}

// ========================================
// PROBLEM RESPONSE FUNCTIONS
// ========================================

interface ProblemResponse {
  id?: string;
  problem_id: string;
  helper_id: string;
  response_type: 'offer_help' | 'advice' | 'escalate';
  message?: string;
  status?: 'active' | 'accepted' | 'completed' | 'rejected';
  created_at?: string;
}

export async function respondToProblem(data: {
  problemId: string;
  helperId: string;
  responseType: 'offer_help' | 'advice' | 'escalate';
  message?: string;
}): Promise<ProblemResponse> {
  const { problemId, helperId, responseType, message } = data;

  const { data: response, error } = await supabase
    .from('problem_responses')
    .insert({
      problem_id: problemId,
      helper_id: helperId,
      response_type: responseType,
      message: message || null,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return response;
}

export async function getProblemResponses(problemId: string): Promise<ProblemResponse[]> {
  const { data, error } = await supabase
    .from('problem_responses')
    .select('*')
    .eq('problem_id', problemId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMyResponses(helperId: string): Promise<ProblemResponse[]> {
  const { data, error } = await supabase
    .from('problem_responses')
    .select('*')
    .eq('helper_id', helperId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ========================================
// PROFILE FUNCTIONS
// ========================================

export async function updateProfileLocation(
  profileId: string, 
  data: {
    city?: string;
    district?: string;
    state?: string;
    serviceRadius?: 'city' | 'nation' | 'world';
  }
): Promise<void> {
  const updateData: Record<string, any> = {};
  
  if (data.city) updateData.city = data.city;
  if (data.district) updateData.district = data.district;
  if (data.state) updateData.state = data.state;
  if (data.serviceRadius) updateData.service_radius = data.serviceRadius;

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', profileId);

  if (error) throw error;
}

export async function getProfileById(profileId: string): Promise<any> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error) throw error;
  return data;
}

// ========================================
// SOS FUNCTIONS
// ========================================

interface SOSAlert {
  id?: string;
  user_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  affected_count?: number;
  status?: 'active' | 'resolved' | 'cancelled';
  responders_count?: number;
  created_at?: string;
}

export async function createSOSAlert(data: {
  userId: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  affectedCount?: number;
}): Promise<SOSAlert> {
  const { data: alert, error } = await supabase
    .from('sos_alerts')
    .insert({
      user_id: data.userId,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      description: data.description,
      affected_count: data.affectedCount || 1,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return alert;
}

export async function getActiveSOSAlerts(): Promise<SOSAlert[]> {
  const { data, error } = await supabase
    .from('sos_alerts')
    .select('*, profiles!inner(full_name, avatar_url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function resolveSOSAlert(alertId: string): Promise<void> {
  const { error } = await supabase
    .from('sos_alerts')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', alertId);

  if (error) throw error;
}

// ========================================
// NEARBY HELPERS / NOTIFIER FUNCTIONS
// ========================================

interface NearbyHelper {
  id: string;
  full_name: string;
  avatar_url?: string;
  roles: string[];
  is_verified: boolean;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export async function findNearbyHelpers(
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<NearbyHelper[]> {
  // Get all verified helpers with location data
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, roles, is_verified, latitude, longitude')
    .eq('is_verified', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error) throw error;

  // Calculate distance and filter (simple Haversine)
  const helpersWithDistance: NearbyHelper[] = [];
  
  for (const p of (profiles || [])) {
    if (!p.latitude || !p.longitude) continue;
    const distance = calculateDistance(latitude, longitude, p.latitude, p.longitude);
    if (distance <= radiusKm) {
      helpersWithDistance.push({
        ...p,
        distance,
      } as NearbyHelper);
    }
  }
  
  return helpersWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export async function notifyNearbyHelpers(
  sosAlertId: string,
  helperIds: string[]
): Promise<void> {
  if (helperIds.length === 0) return;

  const notifications = helperIds.map((helperId) => ({
    sos_alert_id: sosAlertId,
    helper_id: helperId,
    status: 'pending',
    notification_type: 'sos',
  }));

  const { error } = await supabase
    .from('sos_notifications')
    .upsert(notifications, { onConflict: 'sos_alert_id,helper_id' });

  if (error) throw error;
}

export async function getMySOSNotifications(): Promise<any[]> {
  const { data, error } = await supabase
    .from('sos_notifications')
    .select(`
      *,
      sos_alerts!inner(
        id, latitude, longitude, address, description,
        affected_count, created_at, user_id,
        profiles!inner(full_name)
      )
    `)
    .eq('helper_id', (await supabase.auth.getUser()).data.user?.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function respondToSOS(
  notificationId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  const { error } = await supabase
    .from('sos_notifications')
    .update({ 
      status, 
      responded_at: new Date().toISOString() 
    })
    .eq('id', notificationId);

  if (error) throw error;
}

// ========================================
// REPORT PROBLEM FUNCTIONS
// ========================================

export async function reportProblem(data: {
  userId: string;
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  amountNeeded?: number;
}): Promise<any> {
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const { data: problem, error } = await supabase
    .from('problems')
    .insert({
      title: data.title,
      slug: `${slug}-${Date.now()}`,
      story: data.description,
      category: data.category,
      location: data.address,
      amount_needed: data.amountNeeded || 0,
      amount_raised: 0,
      donors_count: 0,
      is_verified: false,
      status: 'pending',
      created_by: data.userId,
    })
    .select()
    .single();

  if (error) throw error;
  return problem;
}
