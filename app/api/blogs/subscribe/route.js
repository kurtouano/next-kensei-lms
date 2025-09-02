import { NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import Subscriber from "@/models/Subscriber"

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      )
    }

    await connectDb()

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() })
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { success: false, message: "This email is already subscribed" },
          { status: 400 }
        )
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true
        existingSubscriber.subscribedAt = new Date()
        await existingSubscriber.save()
        
        return NextResponse.json({
          success: true,
          message: "Welcome back! Your subscription has been reactivated."
        })
      }
    }

    // Create new subscriber
    const subscriber = new Subscriber({
      email: email.toLowerCase(),
      subscribedAt: new Date(),
      isActive: true,
      source: 'blog_page'
    })

    await subscriber.save()

    // Send welcome email using Resend
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      await resend.emails.send({
        from: 'Jotatsu Academy <noreply@jotatsu.com>',
        to: [email],
        subject: 'Welcome to Jotatsu Blog!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Jotatsu Academy</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                             <!-- Header -->
               <div style="background: linear-gradient(135deg, #4a7c59 0%, #6b8e6b 100%); padding: 40px 30px; text-align: center;">
                                   <div style="background-color: rgba(255, 255, 255, 1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.2);">
                    <img src="https://jotatsu.com/jotatsu_logo.png" alt="Jotatsu Academy" style="width: 50px; padding-left: 20px; padding-top: 18px; height: 45px; object-fit: contain;">
                  </div>
                 <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Welcome to Jotatsu Academy</h1>
                 <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px; font-weight: 300;">Your journey to Japanese mastery begins here</p>
               </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Thank you for subscribing!</h2>
                  <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.6;">We're excited to have you join our community of Japanese language learners. You're now part of an exclusive group that gets early access to our latest insights and learning resources.</p>
                </div>
                
                                 <!-- What you'll receive -->
                 <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #4a7c59;">
                   <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">What you'll receive:</h3>
                                       <div style="display: flex; align-items: center; margin-bottom: 16px;">
                      <div style="background-color: #4a7c59; border-radius: 50%; width: 20px; height: 20px; margin-right: 15px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 12px; font-weight: bold; line-height: 1; padding-left: 5px; padding-top: 3px;">✓</span>
                      </div>
                      <span style="color: #374151; font-size: 15px; line-height: 1.4; flex: 1; padding-top: 1px;">Expert Japanese language learning strategies</span>
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 16px;">
                      <div style="background-color: #4a7c59; border-radius: 50%; width: 20px; height: 20px; margin-right: 15px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 12px; font-weight: bold; line-height: 1; padding-left: 5px; padding-top: 3px;">✓</span>
                      </div>
                      <span style="color: #374151; font-size: 15px; line-height: 1.4; flex: 1; padding-top: 1px;">Hiragana, Katakana & Kanji mastery techniques</span>
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 16px;">
                      <div style="background-color: #4a7c59; border-radius: 50%; width: 20px; height: 20px; margin-right: 15px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 12px; font-weight: bold; line-height: 1; padding-left: 5px; padding-top: 3px;">✓</span>
                      </div>
                      <span style="color: #374151; font-size: 15px; line-height: 1.4; flex: 1; padding-top: 1px;">JLPT preparation tips and practice materials</span>
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 0;">
                      <div style="background-color: #4a7c59; border-radius: 50%; width: 20px; height: 20px; margin-right: 15px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 12px; font-weight: bold; line-height: 1; padding-left: 5px; padding-top: 3px;">✓</span>
                      </div>
                      <span style="color: #374151; font-size: 15px; line-height: 1.4; flex: 1; padding-top: 1px;">Cultural insights and authentic Japanese experiences</span>
                    </div>
                 </div>
                
                <!-- Next steps -->
                <div style="text-align: center; margin: 30px 0 0 0;">
                  <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">Your first email will arrive shortly. We typically send 2-3 emails per week, so you won't be overwhelmed.</p>
                  <div style="background-color: #4a7c59; color: white; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 14px;">
                    🚀 Ready to accelerate your Japanese learning?
                  </div>
                </div>
              </div>
              
                             <!-- Footer -->
               <div style="background-color: #f3f4f6; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                 <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">© 2024 Jotatsu Academy. All rights reserved.</p>
                                   <p style="color: #9ca3af; margin: 0; font-size: 12px; line-height: 1.5;">
                    To unsubscribe, <a href="http://localhost:3000/api/blogs/subscribe?action=unsubscribe&email=${email}" style="color: #4a7c59; text-decoration: none;">click here</a> or reply to this email with "UNSUBSCRIBE"
                  </p>
               </div>
            </div>
          </body>
          </html>
        `
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to blog updates!"
    })

  } catch (error) {
    console.error('Blog subscription error:', error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const action = searchParams.get('action')

    if (action === 'unsubscribe' && email) {
      // Redirect to unsubscribe confirmation page
      return NextResponse.redirect(new URL(`/unsubscribe?email=${encodeURIComponent(email)}`, request.url))
    }

    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 }
    )

  } catch (error) {
    console.error('Blog unsubscribe error:', error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    await connectDb()

    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() })
    
    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: "Email not found" },
        { status: 404 }
      )
    }

    subscriber.isActive = false
    subscriber.unsubscribedAt = new Date()
    await subscriber.save()

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed"
    })

  } catch (error) {
    console.error('Blog unsubscribe error:', error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
