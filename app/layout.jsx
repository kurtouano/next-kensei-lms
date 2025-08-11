import "@/app/globals.css"
import { Noto_Sans_JP, Poppins } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "./providers"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Analytics } from "@vercel/analytics/next"

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
  title: "Jotatsu - Learn Japanese Online",
  description: "Master Japanese with Jotatsu Academy's comprehensive online courses. From beginner basics to JLPT test prep, learn through interactive lessons, grammar drills, and real-world conversation practice. Join thousands of successful students.",
  keywords: "learn Japanese online, Japanese course, JLPT test prep, Japanese grammar, hiragana katakana, Japanese conversation, N5 N4 N3 N2 N1, Japanese vocabulary, kanji learning, Japanese tutor online, speak Japanese fluently",
  authors: [{ name: "Jotatsu" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://jotatsu.com"
  }
}

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
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
          </ThemeProvider>
        </AuthProvider>
        <Analytics/> {/* Vercel Analytics */}
      </body>
    </html>
  )
}