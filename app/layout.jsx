import "@/app/globals.css"
import { Noto_Sans_JP, Poppins } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "./providers"

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
  title: "Genko Tree Academy | Japanese E-Learning Platform",
  description: "Learn Japanese online with our Bonsai-themed e-learning platform"
}

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${notoSansJP.variable} ${poppins.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
