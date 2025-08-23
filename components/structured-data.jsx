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
            "name": "Japanese Language Learning Resources",
            "description": "Comprehensive Japanese language learning materials and educational content",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Japanese Language Learning",
                  "description": "Learn Japanese online with comprehensive resources in hiragana, katakana, kanji, and JLPT preparation",
                  "provider": {
                    "@type": "Organization",
                    "name": "Jotatsu Academy"
                  },
                  "offers": {
                    "@type": "Offer",
                    "availability": "https://schema.org/InStock",
                    "url": "https://jotatsu.com/learn-japanese",
                    "seller": {
                      "@type": "Organization",
                      "name": "Jotatsu Academy"
                    }
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
          "offers": {
            "@type": "Offer",
            "price": data.price || 0,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": `https://jotatsu.com/courses/${data.slug || 'course'}`,
            "seller": {
              "@type": "Organization",
              "name": "Jotatsu Academy"
            }
          },
          "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "online",
            "instructor": {
              "@type": "Person",
              "name": data.instructor?.name || "Japanese Instructor"
            },
            "startDate": data.startDate || "2024-01-01",
            "endDate": data.endDate || "2025-12-31"
          }
        }

      case 'courseCatalog':
        return {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Japanese Language Learning Resources",
          "description": "Comprehensive collection of Japanese language learning materials and educational content",
          "itemListElement": [
            {
              "@type": "Service",
              "position": 1,
              "name": "Japanese Writing Systems",
              "description": "Learn hiragana, katakana, and kanji writing systems",
              "provider": {
                "@type": "Organization",
                "name": "Jotatsu Academy"
              },
              "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/InStock",
                "url": "https://jotatsu.com/learn-japanese",
                "seller": {
                  "@type": "Organization",
                  "name": "Jotatsu Academy"
                }
              }
            },
            {
              "@type": "Service",
              "position": 2,
              "name": "JLPT Preparation",
              "description": "Prepare for Japanese Language Proficiency Test levels N5-N1",
              "provider": {
                "@type": "Organization",
                "name": "Jotatsu Academy"
              },
              "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/InStock",
                "url": "https://jotatsu.com/learn-japanese",
                "seller": {
                  "@type": "Organization",
                  "name": "Jotatsu Academy"
                }
              }
            }
          ]
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

      case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
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
