// Subscription API client
import apiClient from './client'

export interface Plan {
  id: string
  name: string
  plan_type: string
  price: number
  currency: string
  duration_days: number
  features: string[]
  is_active: boolean
  is_premium: boolean
  trial_days: number
  display_order: number
  created_at: string
  monthly_equivalent?: number
  savings_percent?: number
  savings_label?: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'expired' | 'pending'
  price_paid?: number
  discount_applied: number
  coupon_id?: string
  started_at?: string
  expires_at?: string
  cancelled_at?: string
  auto_renew: boolean
  created_at: string
}

export interface SubscriptionStatus {
  is_active: boolean
  is_premium: boolean
  plan?: Plan
  subscription?: Subscription
  access_expires_at?: string
  days_remaining?: number
}

export interface CouponValidation {
  is_valid: boolean
  coupon?: {
    id: string
    code: string
    discount_type: string
    discount_value: number
    discount_display: string
    min_order_amount?: number
    valid_until: string
    is_valid: boolean
    error_message?: string
  }
  error_message?: string
  final_price?: number
}

export interface SubscribeRequest {
  plan_id: string
  coupon_code?: string
  payment_method?: string
}

export interface SubscribeResponse {
  subscription_id: string
  plan_id: string
  plan_name: string
  original_price: number
  final_price: number
  discount_amount: number
  coupon_applied?: string
  payment?: {
    id: string
    status: string
  }
  requires_payment: boolean
}

export interface PaymentMockRequest {
  subscription_id: string
  payment_method: string
  success: boolean
}

// Get all subscription plans
export async function getPlans(): Promise<Plan[]> {
  const response = await apiClient.get<Plan[]>('/subscriptions/plans')
  return response.data
}

// Get current user's subscription status
export async function getMySubscription(): Promise<SubscriptionStatus> {
  const response = await apiClient.get<SubscriptionStatus>('/subscriptions/me')
  return response.data
}

// Subscribe to a plan
export async function subscribe(request: SubscribeRequest): Promise<SubscribeResponse> {
  const response = await apiClient.post<SubscribeResponse>('/subscriptions/subscribe', request)
  return response.data
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string): Promise<{
  success: boolean
  subscription_id: string
  status: string
  access_expires_at: string
  message: string
}> {
  const response = await apiClient.delete(`/subscriptions/cancel?subscription_id=${subscriptionId}`)
  return response.data
}

// Validate coupon
export async function applyCoupon(couponCode: string, planId: string): Promise<CouponValidation> {
  const response = await apiClient.post<CouponValidation>('/subscriptions/apply-coupon', {
    coupon_code: couponCode,
    plan_id: planId,
  })
  return response.data
}

// Process mock payment
export async function processMockPayment(request: PaymentMockRequest): Promise<{
  id: string
  status: string
}> {
  const response = await apiClient.post('/payments/mock', request)
  return response.data
}

// Get feature gating info
export async function getFeatureGating(): Promise<{
  is_premium: boolean
  locked_features: string[]
  upgrade_plan?: string
  upgrade_url?: string
}> {
  const response = await apiClient.get('/subscriptions/features')
  return response.data
}
