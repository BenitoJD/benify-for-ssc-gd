/**
 * API client for physical training module.
 */
import apiClient from './client'

// ============ Types ============

export interface ExerciseItem {
  day?: string
  activity: string
  duration?: number
  sets?: number
  reps?: string
  description?: string
}

export interface PhysicalPlan {
  id: string
  title: string
  description?: string
  plan_type: 'running' | 'strength' | 'flexibility' | 'mixed'
  target_gender: 'male' | 'female' | 'all'
  duration_weeks: number
  difficulty_level?: string
  is_premium: boolean
  is_active: boolean
}

export interface PhysicalPlanDetail extends PhysicalPlan {
  exercises: ExerciseItem[]
  schedule?: Record<string, unknown>
  targets?: Record<string, unknown>
}

export interface PhysicalProgressLog {
  id: string
  user_id: string
  physical_plan_id?: string
  date: string
  activity_type: string
  duration_minutes?: number
  distance_km?: number
  pace_min_per_km?: number
  sets_reps?: string
  weight_kg?: number
  performance_rating?: number
  notes?: string
  is_completed: boolean
  created_at: string
  plan_title?: string
}

export interface EnduranceDataPoint {
  date: string
  distance_km: number
  duration_minutes: number
  pace_min_per_km: number
}

export interface WeeklyProgressSummary {
  week_start: string
  total_runs: number
  total_distance_km: number
  total_duration_minutes: number
  average_pace: number
  longest_run_km: number
}

export interface PhysicalReadiness {
  pst_complete: boolean
  pet_complete: boolean
  height_measured: boolean
  chest_measured?: boolean
  weight_measured: boolean
  overall_percentage: number
}

export interface PSTRequirements {
  gender: string
  height_cm_min: number
  chest_cm_min?: number
  chest_expansion_cm?: number
  weight_kg_note?: string
}

export interface PETRequirements {
  gender: string
  run_distance_km: number
  run_time_seconds_max: number
  long_jump_m_min: number
  high_jump_m_min: number
}

export interface MockPETStation {
  station_name: string
  requirement: string
  unit: string
  passing_standard: string
  user_value?: number
  passed?: boolean
}

export interface MockPETResult {
  overall_passed: boolean
  score: number
  stations: MockPETStation[]
  recommendations: string[]
}

// ============ API Functions ============

/**
 * Get all physical training plans.
 */
export async function getPhysicalPlans(params?: {
  target_gender?: string
  plan_type?: string
}): Promise<PhysicalPlan[]> {
  const response = await apiClient.get<PhysicalPlan[]>('/physical/plans', { params })
  return response.data
}

/**
 * Get a specific physical training plan by ID.
 */
export async function getPhysicalPlan(planId: string): Promise<PhysicalPlanDetail> {
  const response = await apiClient.get<PhysicalPlanDetail>(`/physical/plans/${planId}`)
  return response.data
}

/**
 * Log a physical training session.
 */
export async function logPhysicalProgress(data: {
  physical_plan_id?: string
  activity_type: string
  duration_minutes?: number
  distance_km?: number
  pace_min_per_km?: number
  sets_reps?: string
  weight_kg?: number
  performance_rating?: number
  notes?: string
  date?: string
}): Promise<PhysicalProgressLog> {
  const response = await apiClient.post<PhysicalProgressLog>('/physical/progress/log', data)
  return response.data
}

/**
 * Get current user's progress logs.
 */
export async function getMyProgress(params?: {
  activity_type?: string
  days?: number
}): Promise<PhysicalProgressLog[]> {
  const response = await apiClient.get<PhysicalProgressLog[]>('/physical/progress/me', { params })
  return response.data
}

/**
 * Get endurance tracking data for charts.
 */
export async function getEnduranceData(days = 30): Promise<EnduranceDataPoint[]> {
  const response = await apiClient.get<EnduranceDataPoint[]>('/physical/endurance', {
    params: { days }
  })
  return response.data
}

/**
 * Get weekly progress summaries.
 */
export async function getWeeklySummary(weeks = 4): Promise<WeeklyProgressSummary[]> {
  const response = await apiClient.get<WeeklyProgressSummary[]>('/physical/weekly-summary', {
    params: { weeks }
  })
  return response.data
}

/**
 * Get physical readiness status.
 */
export async function getPhysicalReadiness(): Promise<PhysicalReadiness> {
  const response = await apiClient.get<PhysicalReadiness>('/physical/readiness')
  return response.data
}

/**
 * Get PST requirements.
 */
export async function getPSTRequirements(): Promise<PSTRequirements> {
  const response = await apiClient.get<PSTRequirements>('/physical/requirements/pst')
  return response.data
}

/**
 * Get PET requirements.
 */
export async function getPETRequirements(): Promise<PETRequirements> {
  const response = await apiClient.get<PETRequirements>('/physical/requirements/pet')
  return response.data
}

/**
 * Calculate mock PET results.
 */
export async function calculateMockPET(data: {
  height_cm?: number
  chest_cm?: number
  weight_kg?: number
  run_time_seconds?: number
  long_jump_m?: number
  high_jump_m?: number
}): Promise<MockPETResult> {
  const response = await apiClient.post<MockPETResult>('/physical/mock-pet', data)
  return response.data
}
