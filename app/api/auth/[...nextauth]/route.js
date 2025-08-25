// app/api/auth/[...nextauth]/route.js
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

          // Return user data including role and additional fields
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "student",
            icon: user.icon,
            country: user.country || "Bonsai Garden Resident",
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
      try {
        await connectDb();
        
        if (account.provider === "google") {  
          // Check if user exists
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create user directly in callback with role
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              provider: account.provider,
              providerId: account.providerAccountId,
              role: "student", // Default role for new Google users
              country: "Bonsai Garden Resident",
              lastSeen: new Date(),
              lastLogin: new Date()
            });
            
            // Create bonsai for new user
            const Bonsai = (await import("@/models/Bonsai")).default;
            const bonsai = await Bonsai.create({ userRef: newUser._id });
            newUser.bonsai = bonsai._id;
            await newUser.save();
            
            console.log("Created new Google user:", newUser.email, "with role:", newUser.role);
          } else {
            // Update lastSeen and lastLogin for existing user
            await User.findByIdAndUpdate(existingUser._id, {
              lastSeen: new Date(),
              lastLogin: new Date()
            });
            console.log("Google user already exists:", existingUser.email, "role:", existingUser.role);
          }
        } else if (account.provider === "credentials") {
          // Update lastSeen and lastLogin for credentials login
          await User.findOneAndUpdate(
            { email: user.email },
            {
              lastSeen: new Date(),
              lastLogin: new Date()
            }
          );
        }
        
      } catch (error){ 
        console.error("Error in signIn callback:", error)
        return false; // Block login on error
      }
      return true; 
    },

    async jwt({ token, user, account }) {
      // Handle both Google and Credentials - INCLUDE ALL USER DATA
      if (user) {
        // First time login - set user data in token
        token.role = user.role || "student";
        token.id = user.id;
        token.icon = user.icon;
        token.country = user.country;
      }
      
      // For Google login, get additional data from DB
      if (account?.provider === "google") {
        try {
          await connectDb();
          const dbUser = await User.findOne({ email: token.email });
          
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser._id.toString();
            token.icon = dbUser.icon;
            token.country = dbUser.country;
          }
        } catch (error) {
          console.error("JWT callback error:", error);
          // Fallback values
          token.role = token.role || "student";
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      // Always set these values in session for role protection
      session.user.role = token.role || "student";
      session.user.id = token.id;
      session.user.icon = token.icon;
      session.user.country = token.country;
      
      return session;
    },

    // Redirect based on user role after login
    async redirect({ url, baseUrl }) {
      // If it's a relative URL, prepend baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // If it's the same origin, allow it
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default redirect to role-based dashboard
      return `${baseUrl}/dashboard`; // Middleware will redirect based on role
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Make sure secret is set
  secret: process.env.NEXTAUTH_SECRET,
  
  pages: {
    signIn: "/auth/login", // Your existing login page
  },
  
  // Debug logging for development
  debug: process.env.NODE_ENV === "development",
  
  // Vercel compatibility settings
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