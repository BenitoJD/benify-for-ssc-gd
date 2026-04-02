import type { PhysicalPlan } from '@/lib/api/physical'

interface PhysicalPlansSectionProps {
  plans: PhysicalPlan[]
  t: (key: string) => string
}

function formatPlanTypeLabel(planType: PhysicalPlan['plan_type']) {
  return planType.charAt(0).toUpperCase() + planType.slice(1)
}

export function PhysicalPlansSection({ plans, t }: PhysicalPlansSectionProps) {
  return (
    <div className="card-brilliant p-8">
      <div className="mb-8 border-b-2 border-[var(--border-light)] pb-4">
        <h2 className="font-display text-2xl font-bold text-[var(--text-main)]">
          {t('physical.plans.title')}
        </h2>
        <p className="mt-2 text-sm font-medium text-[var(--text-muted)]">
          {plans.length > 0
            ? `${plans.length} plan${plans.length === 1 ? '' : 's'} available for your profile.`
            : t('physical.plans.noPlans')}
        </p>
      </div>

      {plans.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="rounded-2xl border-2 border-[var(--border-light)] bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-main)]">{plan.title}</h3>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    {plan.description || 'Structured physical preparation for your SSC GD goals.'}
                  </p>
                </div>
                {plan.is_premium && (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-yellow-800">
                    {t('common.premium')}
                  </span>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-800">
                  {formatPlanTypeLabel(plan.plan_type)}
                </span>
                <span className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-800">
                  {plan.duration_weeks} {t('physical.plans.weeks')}
                </span>
                <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gray-700">
                  {plan.target_gender}
                </span>
                {plan.difficulty_level && (
                  <span className="rounded-lg bg-purple-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-purple-800">
                    {plan.difficulty_level}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-[var(--border-light)] bg-gray-50 px-6 py-12 text-center">
          <p className="text-base font-bold text-[var(--text-main)]">
            {t('physical.plans.noPlans')}
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Complete your onboarding profile to unlock plans tailored to your physical standards.
          </p>
        </div>
      )}
    </div>
  )
}
