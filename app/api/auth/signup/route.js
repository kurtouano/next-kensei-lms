import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import User from "@/models/User.js";
import bcryptjs from "bcryptjs";

export async function POST(req) {
  try {
    await connectDb();
    const { name, email, password, provider, providerId} = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    let hashedPassword = null;
    if (provider === "credentials") {
        hashedPassword = await bcryptjs.hash(password, 10);
    }

    await User.create({ // Create new user in DB credentials/google
      name,
      email,
      password: hashedPassword,
      provider,
      providerId,
    });
    return NextResponse.json({ message: "User is Registered" }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

