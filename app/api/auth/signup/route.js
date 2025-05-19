import { NextResponse } from "next/server";
import { connnectDb } from "@/lib/mongodb";
import User from "@/models/User.js";
import bcryptjs from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    await connnectDb();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log("User registered:", { name, email });
    return NextResponse.json({ message: "User is Registered" }, { status: 201 });
  } catch (error) {
    console.error("Error in POST request:", error);

    // Duplicate key error handler
    if (error.code === 11000) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

