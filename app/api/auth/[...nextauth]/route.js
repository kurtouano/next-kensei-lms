// For Logging In Only

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import User from "@/models/User"
import { connectDb } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { signIn } from "next-auth/react"

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

          if (user.provider !== "credentials") {
            throw new Error("Please log in using Google.");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error("Invalid password.")
          }

          // If everything is good
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          }
          
        } catch (error) {
          console.error("Error in authorize function:", error)
          throw new Error(error.message || "Login failed"); // re-throw it
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  
  callbacks: { // For Google Login ONLY
    async signIn({ user, account }) {
      if (account.provider === "google") {  
        try {
          const res = await fetch("http://localhost:3000/api/auth/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              provider: account.provider,
              providerId: account.providerAccountId,
            }),
          });

          if (!res.ok) {
            return user;
          }
        } catch (error){ 
          console.error("Error in signIn callback:", error)
        }
      }
      return true; 
    }
  },

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login", // Redirect to login page if not authenticated/Logout
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
