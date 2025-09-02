import "@/app/globals.css"
import { Noto_Sans_JP, Poppins } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "./providers"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Analytics } from "@vercel/analytics/next"
import { StructuredData } from "@/components/structured-data"
import OnlineStatusTracker from "@/components/OnlineStatusTracker"
import { SpeedInsights } from "@vercel/speed-insights/next"

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata = {
  title: "Learn Japanese Online - Complete Language Courses & JLPT Prep | Jotatsu Academy",
  description: "Master Japanese online with Jotatsu Academy! Complete language courses covering grammar, vocabulary, conversation skills, and JLPT N5-N1 preparation. Start your Japanese learning journey today with expert instructors.",
  keywords: [
    "Japanese language learning",
    "learn Japanese online",
    "Japanese course",
    "Japanese grammar",
    "Japanese vocabulary", 
    "Japanese conversation",
    "Japanese pronunciation",
    "Japanese writing",
    "Japanese reading",
    "Japanese speaking",
    "Japanese listening",
    "JLPT test prep",
    "JLPT N5",
    "JLPT N4", 
    "JLPT N3",
    "JLPT N2",
    "JLPT N1",
    "Japanese for beginners",
    "Japanese intermediate",
    "Japanese advanced",
    "Japanese online course",
    "Japanese tutor online",
    "Japanese language school",
    "Japanese study materials",
    "Japanese practice exercises",
    "Japanese culture",
    "Japanese business",
    "Japanese travel phrases",
    "Japanese numbers",
    "Japanese colors",
    "Japanese family words",
    "Japanese food vocabulary",
    "Japanese time expressions",
    "Japanese particles",
    "Japanese verb conjugation",
    "Japanese adjectives",
    "Japanese honorifics",
    "Japanese keigo"
  ].join(", "),
  authors: [{ name: "Jotatsu Academy", url: "https://jotatsu.com" }],
  creator: "Jotatsu Academy",
  publisher: "Jotatsu Academy",
  icons: {
    icon: '/jotatsu_logo.png',
    shortcut: '/jotatsu_logo.png',
    apple: '/jotatsu_logo.png',
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/jotatsu_logo.png',
      },
    ],
  },
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
    canonical: "https://jotatsu.com"
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jotatsu.com',
    siteName: 'Jotatsu Academy',
    title: 'Learn Japanese Online - Complete Language Courses & JLPT Prep',
    description: 'Master Japanese online with Jotatsu Academy! Complete language courses covering grammar, vocabulary, conversation skills, and JLPT preparation. Interactive lessons and expert instruction.',
    images: [
      {
        url: 'https://jotatsu.com/jotatsu_logo_full.png',
        width: 1200,
        height: 630,
        alt: 'Jotatsu Academy - Learn Japanese Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn Japanese Online - Complete Language Courses & JLPT Prep',
    description: 'Master Japanese online with Jotatsu Academy! Complete language courses covering grammar, vocabulary, conversation skills, and JLPT preparation. Interactive lessons and expert instruction.',
    images: ['https://jotatsu.com/jotatsu_logo_full.png'],
    creator: '@jotatsu_academy',
  },
  category: 'Education',
  classification: 'Japanese Language Learning',
  other: {
    'google-site-verification': 'your-verification-code-here',
    'msvalidate.01': 'your-bing-verification-code-here',
  }
}

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <meta name="theme-color" content="#4a7c59" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Jotatsu Academy" />
        <meta name="application-name" content="Jotatsu Academy" />
        <meta name="msapplication-TileColor" content="#4a7c59" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Structured Data for SEO */}
        <StructuredData type="organization" />
        <StructuredData type="website" />
      </head>
      <body className={`${notoSansJP.variable} ${poppins.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <OnlineStatusTracker /> {/* Online Status Tracker for User Activity */}
          </ThemeProvider>
        </AuthProvider>
        <Analytics/> {/* Vercel Analytics */}
        <SpeedInsights/> {/* Vercel Speed Insights */}
      </body>
    </html>
  )
}