"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { ArrowLeft, CreditCard, Shield, Lock, CheckCircle } from "lucide-react"

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Get course details from URL parameters
  const courseId = searchParams.get("courseId")
  const courseTitle = searchParams.get("title") || "Course"
  const coursePrice = Number.parseFloat(searchParams.get("price")) || 0
  const courseCredits = searchParams.get("credits") || 0
  const courseModules = searchParams.get("modules") || 0

  const [formData, setFormData] = useState({
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    cardholderName: "",
    country: "",
    postalCode: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentSuccess(true)
    }, 3000)
  }

  if (paymentSuccess) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="border-[#dce4d7] bg-white shadow-lg">
              <CardContent className="p-8 text-center">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h1 className="mb-4 text-3xl font-bold text-[#2c3e2d]">Payment Successful!</h1>
                <p className="mb-6 text-[#5c6d5e]">
                  Thank you for subscribing to <strong>{courseTitle}</strong>. You now have full access to the course.
                </p>
                <div className="mb-6 rounded-lg bg-[#eef2eb] p-4">
                  <div className="flex items-center justify-center mb-2">
                    <BonsaiIcon className="mr-2 h-5 w-5 text-[#4a7c59]" />
                    <span className="font-semibold text-[#2c3e2d]">+{courseCredits} Bonsai Credits Added!</span>
                  </div>
                  <p className="text-sm text-[#5c6d5e]">Use these credits to customize your bonsai tree</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Link href={`/lessons/${courseId}`}>
                    <Button className="bg-[#4a7c59] hover:bg-[#3a6147] text-white">Start Learning</Button>
                  </Link>
                  <Link href="/my-learning">
                    <Button variant="outline" className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]">
                      My Learning
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Link href="/courses" className="inline-flex items-center mb-6 text-[#4a7c59] hover:text-[#3a6147]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Course Summary */}
            <div className="lg:col-span-1">
              <Card className="border-[#dce4d7] bg-white shadow-sm sticky top-8">
                <CardHeader>
                  <CardTitle className="text-[#2c3e2d]">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-[#2c3e2d] mb-2">{courseTitle}</h3>
                    <div className="space-y-2 text-sm text-[#5c6d5e]">
                      <div className="flex justify-between">
                        <span>Modules:</span>
                        <span>{courseModules}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonsai Credits:</span>
                        <span className="flex items-center">
                          <BonsaiIcon className="mr-1 h-3 w-3 text-[#4a7c59]" />
                          {courseCredits}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lifetime Access:</span>
                        <span>✓</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Certificate:</span>
                        <span>✓</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-[#dce4d7]" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${coursePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>$0.00</span>
                    </div>
                    <Separator className="bg-[#dce4d7]" />
                    <div className="flex justify-between font-bold text-lg text-[#2c3e2d]">
                      <span>Total:</span>
                      <span>${coursePrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-[#eef2eb] rounded-lg">
                    <div className="flex items-center text-sm text-[#2c3e2d]">
                      <Shield className="mr-2 h-4 w-4 text-[#4a7c59]" />
                      30-day money-back guarantee
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-2 w-full">
              <Card className="border-[#dce4d7] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-[#2c3e2d]">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Information
                  </CardTitle>
                  <div className="flex items-center text-sm text-[#5c6d5e]">
                    <Lock className="mr-1 h-4 w-4" />
                    Your payment information is secure and encrypted
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePayment} className="space-y-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        required
                        className="border-[#dce4d7] focus:border-[#4a7c59]"
                      />
                    </div>

                    {/* Card Information */}
                    <div className="space-y-4">
                      <Label>Card Information</Label>
                      <div className="space-y-3">
                        <Input
                          name="cardNumber"
                          type="text"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 1234 1234 1234"
                          maxLength="19"
                          required
                          className="border-[#dce4d7] focus:border-[#4a7c59]"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            name="expiryDate"
                            type="text"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            maxLength="5"
                            required
                            className="border-[#dce4d7] focus:border-[#4a7c59]"
                          />
                          <Input
                            name="cvc"
                            type="text"
                            value={formData.cvc}
                            onChange={handleInputChange}
                            placeholder="CVC"
                            maxLength="4"
                            required
                            className="border-[#dce4d7] focus:border-[#4a7c59]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cardholder Name */}
                    <div className="space-y-2">
                      <Label htmlFor="cardholderName">Cardholder Name</Label>
                      <Input
                        id="cardholderName"
                        name="cardholderName"
                        type="text"
                        value={formData.cardholderName}
                        onChange={handleInputChange}
                        placeholder="Full name on card"
                        required
                        className="border-[#dce4d7] focus:border-[#4a7c59]"
                      />
                    </div>

                    {/* Billing Address */}
                    <div className="space-y-4">
                      <Label>Billing Address</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Input
                            name="country"
                            type="text"
                            value={formData.country}
                            onChange={handleInputChange}
                            placeholder="Country"
                            required
                            className="border-[#dce4d7] focus:border-[#4a7c59]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            name="postalCode"
                            type="text"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            placeholder="Postal Code"
                            required
                            className="border-[#dce4d7] focus:border-[#4a7c59]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-[#4a7c59] hover:bg-[#3a6147] text-white py-3 text-lg font-semibold"
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing Payment...
                        </div>
                      ) : (
                        `Complete Payment - $${coursePrice.toFixed(2)}`
                      )}
                    </Button>

                    {/* Security Notice */}
                    <div className="text-center text-xs text-[#5c6d5e] space-y-1">
                      <p>By completing your purchase, you agree to our Terms of Service.</p>
                      <div className="flex items-center justify-center space-x-4">
                        <span className="flex items-center">
                          <Shield className="mr-1 h-3 w-3" />
                          SSL Secured
                        </span>
                        <span>•</span>
                        <span>256-bit Encryption</span>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
