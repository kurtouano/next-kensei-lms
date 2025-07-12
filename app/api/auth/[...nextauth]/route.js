// For Logging In Only

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
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

          if (user.provider !== "credentials") {
            throw new Error("Please log in using Google.");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error("Invalid password.")
          }

          // If everything is good - INCLUDE ROLE HERE
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "student", // ADD THIS
          }
          
        } catch (error) {
          console.error("Error in authorize function:", error)
          throw new Error(error.message || "Login failed");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {  
        try {
          await connectDb(); // CONNECT TO DB DIRECTLY INSTEAD OF FETCH
          
          // Check if user exists
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create user directly in callback
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              provider: account.provider,
              providerId: account.providerAccountId,
              role: "student"
            });
            
            // Create bonsai for new user
            const Bonsai = (await import("@/models/Bonsai")).default;
            const bonsai = await Bonsai.create({ userRef: newUser._id });
            newUser.bonsai = bonsai._id;
            await newUser.save();
            
            console.log("Created new Google user:", newUser.email);
          } else {
            console.log("Google user already exists:", existingUser.email);
          }
          
        } catch (error){ 
          console.error("Error in signIn callback:", error)
          return false; // BLOCK LOGIN ON ERROR
        }
      }
      return true; 
    },

    async jwt({ token, user, account }) {
      // HANDLE BOTH GOOGLE AND CREDENTIALS
      if (user) {
        // First time login - set user data in token
        token.role = user.role || "student";
        token.id = user.id;
      }
      
      // For Google login, get additional data from DB
      if (account?.provider === "google") {
        try {
          await connectDb();
          const dbUser = await User.findOne({ email: token.email });
          
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser._id.toString();
          }
        } catch (error) {
          console.error("JWT callback error:", error);
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      // ALWAYS SET THESE VALUES
      session.user.role = token.role || "student";
      session.user.id = token.id;
      return session;
    },

    // ADD REDIRECT CALLBACK FOR BETTER CONTROL
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      // Default redirect
      return `${baseUrl}/my-learning`
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // MAKE SURE SECRET IS SET
  secret: process.env.NEXTAUTH_SECRET,
  
  pages: {
    signIn: "/auth/login",
  },
  
  // ADD DEBUG LOGGING FOR PRODUCTION
  debug: process.env.NODE_ENV === "development",
  
  // ADD THESE FOR VERCEL COMPATIBILITY
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }