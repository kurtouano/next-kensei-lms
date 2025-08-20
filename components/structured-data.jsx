export function StructuredData({ type, data }) {
  const generateStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": "Jotatsu Academy",
          "alternateName": "Jotatsu",
          "description": "Online Japanese language learning academy offering comprehensive courses in hiragana, katakana, kanji, and JLPT preparation.",
          "url": "https://jotatsu.com",
          "logo": "https://jotatsu.com/logo.png",
          "image": "https://jotatsu.com/og-image.jpg",
          "sameAs": [
            "https://www.youtube.com/@KenseiSensei",
            "https://twitter.com/jotatsu_academy",
            "https://www.facebook.com/jotatsuacademy",
            "https://www.instagram.com/jotatsu_academy"
          ],
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "US"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "support@jotatsu.com"
          },
          "foundingDate": "2024",
          "slogan": "Master Japanese Online",
          "knowsAbout": [
            "Japanese Language Learning",
            "Hiragana",
            "Katakana", 
            "Kanji",
            "JLPT Preparation",
            "Japanese Grammar",
            "Japanese Conversation",
            "Japanese Culture"
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Japanese Language Courses",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Course",
                  "name": "Japanese Basics - Hiragana & Katakana",
                  "description": "Learn the Japanese writing systems: hiragana and katakana",
                  "provider": {
                    "@type": "Organization",
                    "name": "Jotatsu Academy"
                  }
                }
              },
              {
                "@type": "Offer", 
                "itemOffered": {
                  "@type": "Course",
                  "name": "JLPT N5 Preparation",
                  "description": "Complete preparation for Japanese Language Proficiency Test N5",
                  "provider": {
                    "@type": "Organization",
                    "name": "Jotatsu Academy"
                  }
                }
              }
            ]
          }
        }

      case 'course':
        return {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": data.title,
          "description": data.description,
          "provider": {
            "@type": "Organization",
            "name": "Jotatsu Academy",
            "sameAs": "https://jotatsu.com"
          },
          "courseMode": "online",
          "educationalLevel": data.level || "Beginner",
          "inLanguage": ["en", "ja"],
          "teaches": [
            "Japanese Language",
            "Hiragana",
            "Katakana",
            "Kanji",
            "Japanese Grammar",
            "Japanese Vocabulary",
            "Japanese Conversation"
          ],
          "coursePrerequisites": data.prerequisites || "No prior knowledge required",
          "educationalCredentialAwarded": "Certificate of Completion",
          "timeRequired": data.duration || "PT10H",
          "numberOfCredits": data.credits || 1,
          "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "online",
            "instructor": {
              "@type": "Person",
              "name": data.instructor?.name || "Japanese Instructor"
            }
          }
        }

      case 'blog':
        return {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": data.title,
          "description": data.excerpt || data.description,
          "author": {
            "@type": "Person",
            "name": data.author?.name || "Jotatsu Academy"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Jotatsu Academy",
            "logo": {
              "@type": "ImageObject",
              "url": "https://jotatsu.com/logo.png"
            }
          },
          "datePublished": data.publishedAt || data.createdAt,
          "dateModified": data.updatedAt || data.publishedAt || data.createdAt,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://jotatsu.com/blogs/${data.slug}`
          },
          "image": data.thumbnail || "https://jotatsu.com/og-image.jpg",
          "keywords": data.tags?.join(", ") || "Japanese learning, Japanese language, Japanese culture",
          "articleSection": data.category || "Japanese Learning",
          "wordCount": data.wordCount || 500
        }

      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Jotatsu Academy",
          "description": "Learn Japanese online with comprehensive courses in hiragana, katakana, kanji, and JLPT preparation.",
          "url": "https://jotatsu.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://jotatsu.com/courses?search={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Jotatsu Academy"
          }
        }

      default:
        return null
    }
  }

  const structuredData = generateStructuredData()
  
  if (!structuredData) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}
