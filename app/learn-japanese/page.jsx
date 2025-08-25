import { StructuredData } from "@/components/structured-data"

export const metadata = {
  title: "Learn Japanese Online - Complete Guide to Hiragana, Katakana & Kanji | Jotatsu Academy",
  description: "Master Japanese online with Jotatsu Academy! Complete guide to learning hiragana, katakana, kanji, and JLPT preparation. Start your Japanese learning journey today with expert instructors and interactive lessons.",
  keywords: [
    "learn Japanese online",
    "learn Japanese",
    "Japanese learning",
    "hiragana learning",
    "katakana practice", 
    "kanji study",
    "JLPT test prep",
    "Japanese for beginners",
    "Japanese course online",
    "Japanese language learning",
    "how to learn Japanese",
    "Japanese alphabet",
    "Japanese writing systems",
    "Japanese pronunciation guide",
    "Japanese grammar basics",
    "Japanese vocabulary list",
    "Japanese conversation practice",
    "Japanese study plan",
    "Japanese learning resources",
    "Japanese online lessons",
    "Japanese language course",
    "Japanese for English speakers",
    "Japanese learning tips",
    "Japanese practice exercises",
    "Japanese reading practice",
    "Japanese writing practice"
  ].join(", "),
  authors: [{ name: "Jotatsu Academy", url: "https://jotatsu.com" }],
  creator: "Jotatsu Academy",
  publisher: "Jotatsu Academy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://jotatsu.com/learn-japanese"
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jotatsu.com/learn-japanese',
    siteName: 'Jotatsu Academy',
    title: 'Learn Japanese Online - Complete Guide to Hiragana, Katakana & Kanji',
    description: 'Master Japanese online with Jotatsu Academy! Complete guide to learning Japanese writing systems and JLPT preparation.',
    images: [
      {
        url: 'https://jotatsu.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Learn Japanese Online with Jotatsu Academy - Complete Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn Japanese Online - Complete Guide to Hiragana, Katakana & Kanji',
    description: 'Master Japanese online with Jotatsu Academy! Complete guide to learning Japanese writing systems and JLPT preparation.',
    images: ['https://jotatsu.com/og-image.jpg'],
  }
}

export default function LearnJapanesePage() {
  return (
    <>
      {/* Enhanced Structured Data for Learn Japanese Page */}
      <StructuredData 
        type="learnJapanese" 
        data={{
          name: "Learn Japanese Online - Complete Guide",
          description: "Complete guide to learning Japanese online with hiragana, katakana, kanji, and JLPT preparation.",
          url: "https://jotatsu.com/learn-japanese",
          faqs: [
            {
              question: "How do I start learning Japanese?",
              answer: "Start with hiragana, then katakana, followed by basic grammar and vocabulary. Our structured learning path takes you from complete beginner to advanced levels."
            },
            {
              question: "How long does it take to learn Japanese?",
              answer: "Basic proficiency (JLPT N5) takes 6-12 months with regular study. Advanced levels (JLPT N1) typically require 3-5 years of dedicated learning."
            },
            {
              question: "What are the three Japanese writing systems?",
              answer: "Hiragana (ひらがな) for native words and grammar, Katakana (カタカナ) for foreign words, and Kanji (漢字) for meaning-based writing."
            },
            {
              question: "How do I prepare for the JLPT test?",
              answer: "Study systematically through our JLPT preparation courses, practice with mock tests, and focus on the specific skills required for your target level."
            },
            {
              question: "Can I learn Japanese online effectively?",
              answer: "Yes! Our online platform provides interactive lessons, real-time feedback, and comprehensive resources that make learning Japanese online both effective and engaging."
            }
          ]
        }} 
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-[#f8f7f4]">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-[#4a7c59] to-[#6b8e6b] text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Learn Japanese Online
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              Master the Japanese language with our comprehensive online courses. From beginner <strong>hiragana</strong> and <strong>katakana</strong> 
              to advanced <strong>JLPT N1</strong> preparation, start your journey to Japanese fluency today. Our proven learning methods 
              help thousands of students achieve their Japanese language goals faster and more effectively.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/courses" className="bg-white text-[#4a7c59] hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg transition-colors">
                Start Learning Now
              </a>
              <a href="/about" className="border-2 border-white text-white hover:bg-white hover:text-[#4a7c59] px-8 py-4 text-lg font-semibold rounded-lg transition-colors">
                About Our Academy
              </a>
            </div>
            
            {/* Additional internal links for SEO */}
            <div className="mt-8 text-center">
              <p className="text-white/80 mb-4">Quick Navigation:</p>
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <a href="/courses" className="text-white/90 hover:text-white underline">Japanese Courses</a>
                <span className="text-white/60">•</span>
                <a href="/blogs" className="text-white/90 hover:text-white underline">Japanese Learning Blog</a>
                <span className="text-white/60">•</span>
                <a href="/subscription" className="text-white/90 hover:text-white underline">Learning Plans</a>
                <span className="text-white/60">•</span>
                <a href="/about" className="text-white/90 hover:text-white underline">About Jotatsu</a>
              </div>
            </div>
          </div>
        </section>

        {/* Japanese Writing Systems Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#2c3e2d] mb-6">
                Master Japanese Writing Systems
              </h2>
              <p className="text-xl text-[#5c6d5e] max-w-3xl mx-auto">
                Japanese uses three writing systems. Learn each one systematically to build a strong foundation 
                for reading, writing, and understanding Japanese.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-8 bg-[#f8f7f4] rounded-lg border border-[#dce4d7]">
                <div className="w-20 h-20 bg-[#4a7c59] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl font-bold">あ</span>
                </div>
                <h3 className="text-2xl font-semibold text-[#2c3e2d] mb-4">Hiragana (ひらがな)</h3>
                <p className="text-[#5c6d5e] mb-4 leading-relaxed">
                  The foundation of Japanese writing. Hiragana is used for native Japanese words, 
                  grammatical particles, and verb endings. Start here to build your reading skills.
                </p>
                <ul className="text-left text-[#5c6d5e] space-y-2">
                  <li>• 46 basic characters</li>
                  <li>• Used for Japanese words</li>
                  <li>• Grammatical particles</li>
                  <li>• Verb conjugations</li>
                </ul>
              </div>

              <div className="text-center p-8 bg-[#f8f7f4] rounded-lg border border-[#dce4d7]">
                <div className="w-20 h-20 bg-[#4a7c59] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl font-bold">ア</span>
                </div>
                <h3 className="text-2xl font-semibold text-[#2c3e2d] mb-4">Katakana (カタカナ)</h3>
                <p className="text-[#5c6d5e] mb-4 leading-relaxed">
                  Used for foreign words, names, onomatopoeia, and emphasis. Katakana helps you 
                  read borrowed words and gives your writing a modern, international feel.
                </p>
                <ul className="text-left text-[#5c6d5e] space-y-2">
                  <li>• 46 basic characters</li>
                  <li>• Foreign loan words</li>
                  <li>• Onomatopoeia</li>
                  <li>• Emphasis and style</li>
                </ul>
              </div>

              <div className="text-center p-8 bg-[#f8f7f4] rounded-lg border border-[#dce4d7]">
                <div className="w-20 h-20 bg-[#4a7c59] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl font-bold">漢</span>
                </div>
                <h3 className="text-2xl font-semibold text-[#2c3e2d] mb-4">Kanji (漢字)</h3>
                <p className="text-[#5c6d5e] mb-4 leading-relaxed">
                  Chinese characters adapted for Japanese. Kanji represent ideas and concepts, 
                  making reading faster and more efficient once mastered.
                </p>
                <ul className="text-left text-[#5c6d5e] space-y-2">
                  <li>• Thousands of characters</li>
                  <li>• Meaning-based writing</li>
                  <li>• Multiple readings</li>
                  <li>• Cultural significance</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* JLPT Preparation Section */}
        <section className="py-16 bg-[#eef2eb]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#2c3e2d] mb-6">
                JLPT Test Preparation - N5 to N1
              </h2>
              <p className="text-xl text-[#5c6d5e] max-w-3xl mx-auto">
                The Japanese Language Proficiency Test (JLPT) is the standard for measuring Japanese ability. 
                Our courses prepare you for each level with targeted study materials and practice tests.
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-6 mb-12">
              {[
                { level: 'N5', title: 'Beginner', desc: 'Basic Japanese', skills: ['Hiragana', 'Katakana', 'Basic Kanji', 'Simple Grammar'] },
                { level: 'N4', title: 'Elementary', desc: 'Everyday Japanese', skills: ['Essential Kanji', 'Basic Grammar', 'Daily Conversations'] },
                { level: 'N3', title: 'Intermediate', desc: 'Business Japanese', skills: ['Intermediate Kanji', 'Complex Grammar', 'Business Terms'] },
                { level: 'N2', title: 'Upper Intermediate', desc: 'Advanced Communication', skills: ['Advanced Kanji', 'Nuanced Grammar', 'Academic Japanese'] },
                { level: 'N1', title: 'Advanced', desc: 'Native-like Proficiency', skills: ['Master Kanji', 'Expert Grammar', 'Professional Japanese'] }
              ].map((jlpt) => (
                <div key={jlpt.level} className="bg-white p-6 rounded-lg shadow-sm border border-[#dce4d7] text-center">
                  <div className="w-16 h-16 bg-[#4a7c59] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl font-bold">{jlpt.level}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#4a7c59] mb-2">JLPT {jlpt.level}</h3>
                  <p className="text-sm text-[#5c6d5e] mb-3 font-medium">{jlpt.title}</p>
                  <p className="text-xs text-[#5c6d5e] mb-4">{jlpt.desc}</p>
                  <ul className="text-xs text-[#5c6d5e] space-y-1">
                    {jlpt.skills.map((skill, index) => (
                      <li key={index}>• {skill}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a href="/courses" className="bg-[#4a7c59] text-white hover:bg-[#3a6147] px-8 py-4 text-lg font-semibold rounded-lg transition-colors">
                View JLPT Preparation Courses
              </a>
            </div>
          </div>
        </section>

        {/* Learning Path Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#2c3e2d] mb-6">
                Your Japanese Learning Journey
              </h2>
              <p className="text-xl text-[#5c6d5e] max-w-3xl mx-auto">
                Follow our proven learning path designed to take you from complete beginner to confident 
                Japanese speaker. Each step builds upon the previous one for maximum retention.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {[
                { step: 1, title: "Master Hiragana", desc: "Learn all 46 hiragana characters with pronunciation and writing practice", duration: "2-3 weeks" },
                { step: 2, title: "Learn Katakana", desc: "Master katakana for foreign words and modern Japanese", duration: "2-3 weeks" },
                { step: 3, title: "Basic Grammar & Vocabulary", desc: "Learn essential grammar patterns and everyday vocabulary", duration: "4-6 weeks" },
                { step: 4, title: "Essential Kanji", desc: "Start with the most common kanji characters (JLPT N5 level)", duration: "8-12 weeks" },
                { step: 5, title: "Conversation Practice", desc: "Build speaking confidence with real-world scenarios", duration: "Ongoing" },
                { step: 6, title: "Advanced Studies", desc: "Progress to higher JLPT levels and specialized topics", duration: "6-12 months" }
              ].map((learningStep) => (
                <div key={learningStep.step} className="flex items-start gap-6 mb-8 p-6 bg-[#f8f7f4] rounded-lg border border-[#dce4d7]">
                  <div className="w-12 h-12 bg-[#4a7c59] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-bold">{learningStep.step}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[#2c3e2d] mb-2">{learningStep.title}</h3>
                    <p className="text-[#5c6d5e] mb-2">{learningStep.desc}</p>
                    <span className="text-sm text-[#4a7c59] font-medium">Duration: {learningStep.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Resources Section for SEO */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#2c3e2d] mb-6">
                Complete Japanese Learning Resources
              </h2>
              <p className="text-xl text-[#5c6d5e] max-w-3xl mx-auto">
                Access comprehensive learning materials designed to take you from beginner to advanced Japanese proficiency. 
                Our resources cover every aspect of Japanese language learning.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[
                {
                  title: "Interactive Lessons",
                  description: "Engage with multimedia content including videos, audio, and interactive exercises that adapt to your learning pace.",
                  features: ["Video tutorials", "Audio pronunciation", "Interactive quizzes", "Progress tracking"]
                },
                {
                  title: "Writing Practice",
                  description: "Master Japanese writing systems with step-by-step guides and practice worksheets for hiragana, katakana, and kanji.",
                  features: ["Stroke order guides", "Practice worksheets", "Writing exercises", "Character recognition"]
                },
                {
                  title: "Grammar Guides",
                  description: "Comprehensive grammar explanations with examples, practice sentences, and common usage patterns.",
                  features: ["Grammar explanations", "Example sentences", "Practice exercises", "Usage patterns"]
                },
                {
                  title: "Vocabulary Building",
                  description: "Systematic vocabulary learning organized by themes, JLPT levels, and practical usage scenarios.",
                  features: ["Themed vocabulary", "JLPT level organization", "Context examples", "Memory techniques"]
                },
                {
                  title: "Conversation Practice",
                  description: "Real-world conversation scenarios, pronunciation practice, and speaking exercises with native speakers.",
                  features: ["Real scenarios", "Pronunciation practice", "Speaking exercises", "Native speaker audio"]
                },
                {
                  title: "JLPT Preparation",
                  description: "Targeted study materials and practice tests for all JLPT levels from N5 to N1.",
                  features: ["Level-specific content", "Practice tests", "Study strategies", "Progress assessment"]
                }
              ].map((resource, index) => (
                <div key={index} className="bg-[#f8f7f4] p-6 rounded-lg border border-[#dce4d7]">
                  <h3 className="text-xl font-semibold text-[#2c3e2d] mb-3">{resource.title}</h3>
                  <p className="text-[#5c6d5e] mb-4 leading-relaxed">{resource.description}</p>
                  <ul className="text-sm text-[#4a7c59] space-y-1">
                    {resource.features.map((feature, idx) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Jotatsu Section */}
        <section className="py-16 bg-[#eef2eb]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#2c3e2d] mb-6">
                Why Choose Jotatsu Academy?
              </h2>
              <p className="text-xl text-[#5c6d5e] max-w-3xl mx-auto">
                Our unique approach combines traditional Japanese language instruction with modern technology 
                and gamification to make learning engaging and effective.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "🎓",
                  title: "Expert Instructors",
                  desc: "Learn from native Japanese speakers and certified language teachers with years of experience."
                },
                {
                  icon: "📱",
                  title: "Interactive Learning",
                  desc: "Engage with multimedia content, quizzes, and practice exercises that adapt to your learning pace."
                },
                {
                  icon: "🎮",
                  title: "Gamified Experience",
                  desc: "Earn credits and customize your virtual bonsai tree as you progress through lessons."
                },
                {
                  icon: "📚",
                  title: "Comprehensive Curriculum",
                  desc: "From absolute beginner to advanced JLPT N1, we cover every aspect of Japanese learning."
                },
                {
                  icon: "🏆",
                  title: "Official Certificates",
                  desc: "Earn recognized completion certificates for each course to showcase your achievements."
                },
                {
                  icon: "🌍",
                  title: "Global Community",
                  desc: "Connect with Japanese learners worldwide and practice with native speakers."
                }
              ].map((feature, index) => (
                <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm border border-[#dce4d7]">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-[#2c3e2d] mb-3">{feature.title}</h3>
                  <p className="text-[#5c6d5e] leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#2c3e2d] mb-6">
                Frequently Asked Questions About Learning Japanese
              </h2>
              <p className="text-xl text-[#5c6d5e] max-w-3xl mx-auto">
                Get answers to the most common questions about learning Japanese online and how to get started on your language learning journey.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {[
                {
                  question: "How do I start learning Japanese?",
                  answer: "Start with hiragana, then katakana, followed by basic grammar and vocabulary. Our structured learning path takes you from complete beginner to advanced levels with interactive lessons and practice exercises."
                },
                {
                  question: "How long does it take to learn Japanese?",
                  answer: "Basic proficiency (JLPT N5) takes 6-12 months with regular study. Advanced levels (JLPT N1) typically require 3-5 years of dedicated learning. Our courses are designed to accelerate your progress."
                },
                {
                  question: "What are the three Japanese writing systems?",
                  answer: "Hiragana (ひらがな) for native words and grammar, Katakana (カタカナ) for foreign words, and Kanji (漢字) for meaning-based writing. Each system serves a specific purpose in Japanese communication."
                },
                {
                  question: "How do I prepare for the JLPT test?",
                  answer: "Study systematically through our JLPT preparation courses, practice with mock tests, and focus on the specific skills required for your target level. We provide comprehensive study materials for all JLPT levels."
                },
                {
                  question: "Can I learn Japanese online effectively?",
                  answer: "Yes! Our online platform provides interactive lessons, real-time feedback, and comprehensive resources that make learning Japanese online both effective and engaging. Many students achieve fluency through our online courses."
                },
                {
                  question: "What's the best way to practice Japanese pronunciation?",
                  answer: "Practice with our audio lessons, repeat after native speakers, and use our pronunciation guides. Regular practice with audio content helps develop accurate Japanese pronunciation."
                },
                {
                  question: "How many kanji do I need to know?",
                  answer: "JLPT N5 requires about 100 kanji, N4 about 300, N3 about 650, N2 about 1000, and N1 about 2000. We teach kanji systematically with memory techniques and practice exercises."
                },
                {
                  question: "Is Japanese grammar difficult to learn?",
                  answer: "Japanese grammar has different patterns than English, but our courses break it down into manageable concepts. With practice and our structured approach, Japanese grammar becomes much easier to understand."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-[#f8f7f4] p-6 rounded-lg border border-[#dce4d7]">
                  <h3 className="text-xl font-semibold text-[#2c3e2d] mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-[#5c6d5e] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#4a7c59] to-[#6b8e6b] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Start Your Japanese Learning Journey?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Whether you're a complete beginner wanting to learn hiragana and katakana, 
              or an advanced student preparing for JLPT N1, Jotatsu Academy has the perfect 
              course for you. Join our community of Japanese learners and achieve fluency faster than you ever thought possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/courses" className="bg-white text-[#4a7c59] hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg transition-colors">
                Browse All Courses
              </a>
              <a href="/subscription" className="border-2 border-white text-white hover:bg-white hover:text-[#4a7c59] px-8 py-4 text-lg font-semibold rounded-lg transition-colors">
                View Pricing Plans
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
