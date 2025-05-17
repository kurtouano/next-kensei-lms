"use client"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function SubscriptionPage() {
  const plans = [
    {
      name: "Monthly",
      price: 19.99,
      period: "month",
      description: "Perfect for short-term learners",
      features: [
        "Access to all courses",
        "Premium learning resources",
        "Progress tracking",
        "Quiz assessments",
        "Basic bonsai customization",
        "Email support",
      ],
      limitations: ["No certification exams", "Limited community access"],
      recommended: false,
      buttonText: "Subscribe Monthly",
    },
    {
      name: "Annual",
      price: 14.99,
      period: "month",
      billedAs: "billed annually ($179.88)",
      description: "Our most popular plan",
      features: [
        "Access to all courses",
        "Premium learning resources",
        "Progress tracking",
        "Quiz assessments",
        "Full bonsai customization",
        "Priority email support",
        "Certification exams",
        "Full community access",
        "Monthly live sessions",
      ],
      limitations: [],
      recommended: true,
      buttonText: "Subscribe Annually",
      savings: "Save 25%",
    },
    {
      name: "Lifetime",
      price: 499,
      period: "one-time",
      description: "For dedicated long-term learners",
      features: [
        "Lifetime access to all courses",
        "All premium learning resources",
        "Progress tracking",
        "Quiz assessments",
        "Full bonsai customization",
        "Priority email support",
        "Certification exams",
        "Full community access",
        "Monthly live sessions",
        "Early access to new courses",
        "Exclusive seasonal events",
      ],
      limitations: [],
      recommended: false,
      buttonText: "Get Lifetime Access",
    },
  ]

  const comparisons = [
    {
      title: "Individual Course Purchase",
      benefits: ["Pay only for what you need", "Lifetime access to purchased courses", "Basic resources included"],
      drawbacks: [
        "More expensive per course",
        "No access to premium resources",
        "Limited bonsai customization",
        "No certification exams",
      ],
    },
    {
      title: "Monthly Subscription",
      benefits: [
        "Access to all courses",
        "Premium resources included",
        "Regular new content",
        "Basic bonsai customization",
      ],
      drawbacks: ["Higher monthly cost", "No certification exams", "Limited community features"],
    },
    {
      title: "Annual Subscription",
      benefits: [
        "25% savings compared to monthly",
        "Access to all courses and resources",
        "Full bonsai customization",
        "Certification exams included",
        "Community access",
        "Monthly live sessions",
      ],
      drawbacks: ["Larger upfront payment"],
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      {/* Header - Reused from homepage */}
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-[#2c3e2d]">Subscription Plans</h1>
            <p className="mx-auto max-w-2xl text-[#5c6d5e]">
              Choose the perfect plan for your Japanese learning journey. Subscribe for unlimited access to all courses
              and premium resources.
            </p>
          </div>

          {/* Pricing Plans */}
          <div className="mb-16 grid gap-8 md:grid-cols-3">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative flex flex-col overflow-hidden rounded-lg border ${
                  plan.recommended ? "border-[#4a7c59] bg-white shadow-md" : "border-[#dce4d7] bg-white shadow-sm"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute right-0 top-0 bg-[#4a7c59] px-3 py-1 text-xs font-medium text-white">
                    Best Value
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#2c3e2d]">{plan.name}</h3>
                  <div className="my-4 flex items-baseline">
                    <span className="text-4xl font-bold text-[#2c3e2d]">${plan.price}</span>
                    <span className="ml-1 text-[#5c6d5e]">/{plan.period}</span>
                  </div>
                  {plan.billedAs && <p className="mb-4 text-sm text-[#5c6d5e]">{plan.billedAs}</p>}
                  {plan.savings && (
                    <span className="mb-4 inline-block rounded-full bg-[#eef2eb] px-3 py-1 text-xs font-medium text-[#4a7c59]">
                      {plan.savings}
                    </span>
                  )}
                  <p className="mb-6 text-sm text-[#5c6d5e]">{plan.description}</p>
                  <Button
                    className={`w-full ${
                      plan.recommended
                        ? "bg-[#4a7c59] text-white hover:bg-[#3a6147]"
                        : "border-[#4a7c59] bg-white text-[#4a7c59] hover:bg-[#eef2eb]"
                    }`}
                    variant={plan.recommended ? "default" : "outline"}
                  >
                    {plan.buttonText}
                  </Button>
                </div>
                <div className="flex flex-1 flex-col border-t border-[#dce4d7] bg-[#f8f7f4] p-6">
                  <h4 className="mb-4 font-medium text-[#2c3e2d]">What's included:</h4>
                  <ul className="mb-6 space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <Check className="mr-2 h-4 w-4 shrink-0 text-[#4a7c59]" />
                        <span className="text-[#5c6d5e]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.limitations.length > 0 && (
                    <>
                      <h4 className="mb-4 font-medium text-[#2c3e2d]">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <X className="mr-2 h-4 w-4 shrink-0 text-red-500" />
                            <span className="text-[#5c6d5e]">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Section */}
          <div className="mb-16">
            <h2 className="mb-6 text-center text-2xl font-bold text-[#2c3e2d]">Subscription vs. Individual Courses</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {comparisons.map((comparison, index) => (
                <div key={index} className="rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-xl font-semibold text-[#2c3e2d]">{comparison.title}</h3>
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium text-[#4a7c59]">Benefits</h4>
                    <ul className="space-y-2">
                      {comparison.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <Check className="mr-2 h-4 w-4 shrink-0 text-[#4a7c59]" />
                          <span className="text-[#5c6d5e]">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-[#e67e22]">Drawbacks</h4>
                    <ul className="space-y-2">
                      {comparison.drawbacks.map((drawback, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <X className="mr-2 h-4 w-4 shrink-0 text-red-500" />
                          <span className="text-[#5c6d5e]">{drawback}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-[#2c3e2d]">Frequently Asked Questions</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-lg font-medium text-[#2c3e2d]">Can I cancel my subscription anytime?</h3>
                <p className="text-sm text-[#5c6d5e]">
                  Yes, you can cancel your subscription at any time. If you cancel, you'll still have access until the
                  end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium text-[#2c3e2d]">What happens to my progress if I cancel?</h3>
                <p className="text-sm text-[#5c6d5e]">
                  Your progress is saved for 12 months after cancellation. If you resubscribe within that period, you'll
                  pick up right where you left off.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium text-[#2c3e2d]">Can I switch between subscription plans?</h3>
                <p className="text-sm text-[#5c6d5e]">
                  Yes, you can upgrade or downgrade your subscription at any time. When upgrading, you'll be credited
                  for the unused portion of your current plan.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium text-[#2c3e2d]">Do you offer refunds?</h3>
                <p className="text-sm text-[#5c6d5e]">
                  We offer a 7-day money-back guarantee for new subscribers. If you're not satisfied with our service,
                  contact us within 7 days of your purchase for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Simplified version */}
      <Footer />
    </div>
  )
}
