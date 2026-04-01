'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getPlans, getMySubscription, subscribe, applyCoupon, processMockPayment, Plan, SubscriptionStatus } from '@/lib/api/subscriptions'

function formatPrice(pricePaise: number): string {
  return `₹${(pricePaise / 100).toFixed(0)}`
}

function formatDuration(days: number): string {
  if (days === 0) return 'Free'
  if (days === 30) return '/month'
  if (days === 90) return '/quarter'
  if (days === 365) return '/year'
  return `/${days} days`
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponDiscount, setCouponDiscount] = useState<number>(0)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [plansData, statusData] = await Promise.all([
        getPlans(),
        getMySubscription().catch(() => null)
      ])
      setPlans(plansData)
      setSubscriptionStatus(statusData)
    } catch (err) {
      console.error('Failed to load data:', err)
      // Still show plans even if user is not logged in
      try {
        const plansData = await getPlans()
        setPlans(plansData)
      } catch (e) {
        console.error('Failed to load plans:', e)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectPlan(planId: string) {
    if (!planId) return
    
    setSelectedPlan(planId)
    setCouponCode('')
    setCouponDiscount(0)
    setCouponError('')
    setError('')
    setSuccess('')
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim() || !selectedPlan) return
    
    try {
      const result = await applyCoupon(couponCode, selectedPlan)
      if (result.is_valid && result.final_price !== undefined) {
        const plan = plans.find(p => p.id === selectedPlan)
        if (plan) {
          setCouponDiscount(plan.price - result.final_price)
          setCouponError('')
        }
      } else {
        setCouponDiscount(0)
        setCouponError(result.error_message || 'Invalid coupon')
      }
    } catch (err: any) {
      setCouponDiscount(0)
      setCouponError(err.response?.data?.detail || 'Failed to apply coupon')
    }
  }

  async function handleSubscribe() {
    if (!selectedPlan) return
    
    setProcessing(true)
    setError('')
    setSuccess('')
    
    try {
      // Subscribe to plan
      const result = await subscribe({
        plan_id: selectedPlan,
        coupon_code: couponCode || undefined,
        payment_method: 'mock'
      })
      
      if (!result.requires_payment) {
        setSuccess('Subscription activated successfully!')
        loadData()
        setSelectedPlan(null)
      } else if (result.payment) {
        // Process mock payment
        await processMockPayment({
          subscription_id: result.subscription_id,
          payment_method: 'mock_card',
          success: true
        })
        setSuccess('Payment successful! Your subscription is now active.')
        loadData()
        setSelectedPlan(null)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process subscription')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const currentPlanId = subscriptionStatus?.plan?.id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-600">Benify</Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">Choose the plan that fits your preparation needs</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Current Plan Badge */}
        {subscriptionStatus?.is_premium && subscriptionStatus?.plan && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-primary-100 border border-primary-400 text-primary-700 rounded-lg text-center">
            You are currently subscribed to the <strong>{subscriptionStatus.plan.name}</strong> plan
            {subscriptionStatus.days_remaining !== undefined && subscriptionStatus.days_remaining > 0 && (
              <span> - {subscriptionStatus.days_remaining} days remaining</span>
            )}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlanId === plan.id
            const isSelected = selectedPlan === plan.id
            const finalPrice = plan.price - (plan.id === selectedPlan ? couponDiscount : 0)
            const monthlyPrice = plan.monthly_equivalent ? `₹${(plan.monthly_equivalent / 100).toFixed(0)}/mo` : null

            return (
              <div
                key={plan.id}
                className={`
                  relative bg-white rounded-2xl shadow-sm p-6 transition-all
                  ${plan.is_premium ? 'border-2 border-primary-600' : 'border border-gray-200'}
                  ${isSelected ? 'ring-2 ring-primary-600' : ''}
                `}
              >
                {plan.savings_label && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    {plan.savings_label}
                  </div>
                )}

                {plan.plan_type === 'monthly' && !plan.savings_label && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">
                      {plan.price === 0 ? 'Free' : formatPrice(finalPrice)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500">{formatDuration(plan.duration_days)}</span>
                    )}
                  </div>
                  {monthlyPrice && plan.plan_type !== 'monthly' && (
                    <p className="text-sm text-gray-500 mt-1">≈ {monthlyPrice}</p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div className="block text-center bg-gray-100 text-gray-600 px-4 py-3 rounded-lg font-medium cursor-not-allowed">
                    Current Plan
                  </div>
                ) : plan.price === 0 ? (
                  <Link
                    href="/signup"
                    className="block text-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Get Started
                  </Link>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`
                      w-full py-3 rounded-lg font-medium transition
                      ${isSelected
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'border border-primary-600 text-primary-600 hover:bg-primary-50'
                      }
                    `}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Checkout Section */}
        {selectedPlan && (
          <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Complete Your Subscription</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Have a coupon code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value)
                    setCouponError('')
                    setCouponDiscount(0)
                  }}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="text-sm text-red-600 mt-1">{couponError}</p>
              )}
              {couponDiscount > 0 && (
                <p className="text-sm text-green-600 mt-1">Coupon applied! You save {formatPrice(couponDiscount)}</p>
              )}
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Plan Price</span>
                <span>{formatPrice(plans.find(p => p.id === selectedPlan)?.price || 0)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg mt-2">
                <span>Total</span>
                <span>
                  {formatPrice((plans.find(p => p.id === selectedPlan)?.price || 0) - couponDiscount)}
                </span>
              </div>
            </div>

            <div className="mb-4 text-sm text-gray-500">
              <p className="mb-2">Mock Payment (for testing):</p>
              <p>Card Number: 4111111111111111</p>
              <p>Expiry: 12/28</p>
              <p>CVV: 123</p>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={processing}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        )}

        {/* Feature Comparison */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold">Free</th>
                  <th className="px-6 py-4 text-center font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4">SSC GD Subjects</td>
                  <td className="px-6 py-4 text-center">4</td>
                  <td className="px-6 py-4 text-center">All</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Lessons</td>
                  <td className="px-6 py-4 text-center">100+</td>
                  <td className="px-6 py-4 text-center">500+</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Mock Tests</td>
                  <td className="px-6 py-4 text-center">2/month</td>
                  <td className="px-6 py-4 text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Previous Year Questions</td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Physical Training Plans</td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Document Checklist</td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4">AI Study Recommendations</td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Priority Support</td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">
            © 2024 Benify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
