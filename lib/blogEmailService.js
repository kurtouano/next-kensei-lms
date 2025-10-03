import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBlogNotificationEmail(blog, subscribers) {
  if (!subscribers || subscribers.length === 0) {
    console.log('No active subscribers to notify')
    return
  }

  try {
    // Extract first 2-3 sentences from content for preview
    const contentPreview = extractContentPreview(blog.content, 150)
    
    // Format author name
    const authorName = blog.author?.name || 'Jotatsu Academy'
    
    // Create email HTML
    const emailHtml = createBlogEmailTemplate(blog, contentPreview, authorName)
    
    // Send to all subscribers
    const emailPromises = subscribers.map(subscriber => 
      resend.emails.send({
        from: 'Jotatsu Academy <noreply@jotatsu.com>',
        to: [subscriber.email],
        subject: `${blog.title} | Jotatsu Academy`,
        html: emailHtml,
        headers: {
          'X-Priority': '3',
          'X-Mailer': 'Jotatsu Academy Newsletter',
          'List-Unsubscribe': `<https://jotatsu.com/unsubscribe?email=${subscriber.email}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        }
      })
    )

    await Promise.all(emailPromises)
    console.log(`✅ Blog notification sent to ${subscribers.length} subscribers`)
    
  } catch (error) {
    console.error('❌ Error sending blog notification emails:', error)
    throw error
  }
}

function extractContentPreview(content, maxLength = 500) {
  if (!content) return ''
  
  // Remove HTML tags
  const textContent = content.replace(/<[^>]*>/g, '')
  
  // Find first 5-6 sentences or paragraphs
  const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  let preview = ''
  let sentenceCount = 0
  const maxSentences = 6
  
  for (let i = 0; i < sentences.length && sentenceCount < maxSentences; i++) {
    const sentence = sentences[i].trim()
    if (sentence.length > 10) { // Only include meaningful sentences
      if (preview.length + sentence.length <= maxLength) {
        preview += (preview ? '. ' : '') + sentence
        sentenceCount++
      } else {
        break
      }
    }
  }
  
  return preview + (preview.length < textContent.length ? '...' : '')
}

function createBlogEmailTemplate(blog, contentPreview, authorName) {
  const blogUrl = `https://jotatsu.com/blogs/${blog.slug}`
  const unsubscribeUrl = `https://jotatsu.com/unsubscribe?email=`
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${blog.title} | Jotatsu Academy</title>
      <meta name="x-mailer" content="Jotatsu Academy Newsletter">
      <meta name="x-priority" content="3">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4a7c59 0%, #6b8e6b 100%); padding: 40px 30px; text-align: center;">
          <div style="background-color: rgba(255, 255, 255, 1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.2);">
            <img src="https://jotatsu.com/jotatsu_logo.png" alt="Jotatsu Academy" style="width: 50px; padding-left: 18px; padding-top: 18px; height: 45px; object-fit: contain;">
          </div>
        </div>
        
        <!-- Blog Post Content -->
        <div style="padding: 0;">
          
          <!-- Featured Image -->
          ${blog.featuredImage ? `
            <div style="width: 100%; height: 250px; overflow: hidden; position: relative;">
              <img src="${blog.featuredImage}" alt="${blog.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          ` : ''}
          
          <!-- Blog Info -->
          <div style="padding: 40px 30px;">
            
            <!-- Category Badge -->
            <div style="margin-bottom: 24px;">
              <span style="background-color: #eef2eb; color: #4a7c59; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                ${blog.category}
              </span>
            </div>
            
            <!-- Title -->
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 32px; font-weight: 700; line-height: 1.2; letter-spacing: -0.5px;">
              ${blog.title}
            </h2>
            
            <!-- Meta Info -->
            <div style="margin-bottom: 24px; color: #6b7280; font-size: 14px;">
              <span style="font-weight: 500; margin-right: 30px;">${authorName}</span>
              <span style="font-weight: 500; margin-right: 30px;">${blog.readTime || '5 min read'}</span>
              <span style="font-weight: 500;">${new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            
            <!-- Content Preview -->
            <div style="margin-bottom: 32px; background-color: #f9fafb; padding: 24px; border-radius: 12px; border-left: 4px solid #4a7c59;">
              <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0; font-style: italic;">
                ${contentPreview}
              </p>
            </div>
            
            <!-- Tags -->
            ${blog.tags && blog.tags.length > 0 ? `
              <div style="margin-bottom: 32px;">
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${blog.tags.map(tag => `
                    <span style="background-color: #f3f4f6; color: #6b7280; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">
                      #${tag}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${blogUrl}" style="background-color: #4a7c59; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; transition: background-color 0.2s; box-shadow: 0 4px 12px rgba(74, 124, 89, 0.3);">
                Read Full Article
              </a>
            </div>
            
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 32px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <div style="margin-bottom: 20px;">
            <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px; font-weight: 500;">
              © 2024 Jotatsu Academy. All rights reserved.
            </p>
            <p style="color: #9ca3af; margin: 0; font-size: 12px; line-height: 1.5;">
              You received this email because you subscribed to our blog updates.
            </p>
          </div>
          
          <!-- Unsubscribe Section -->
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
            <p style="color: #6b7280; margin: 0 0 16px 0; font-size: 12px; text-align: center;">
              Want to change how you receive these emails?
            </p>
            <div style="text-align: center;">
              <a href="${unsubscribeUrl}" style="color: #4a7c59; text-decoration: none; font-size: 14px; font-weight: 500; margin-right: 30px;">
                Unsubscribe
              </a>
              <a href="https://jotatsu.com" style="color: #4a7c59; text-decoration: none; font-size: 14px; font-weight: 500;">
                Visit Website
              </a>
            </div>
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `
}
