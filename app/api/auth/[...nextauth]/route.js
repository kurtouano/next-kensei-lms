import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import User from "@/models/User"
import { connectDb } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          await connectDb();

          const user = await User.findOne({ email: credentials.email }).select("+password")

          if (!user) {
            throw new Error("No user found with that email.")
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error("Invalid password.")
          }

          // If everything is good
          return {
            id: user._id,
            name: user.name,
            email: user.email,
          }
          
        } catch (error) {
          console.error("Error in authorize function:", error)
          throw new Error("An error occurred while logging in.")  
        }
      },
      
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
