import { NextResponse } from "next/server";
import { connnectDB } from "@/lib/mongodb";
import User from "@/models/User.js";
import bcryptjs from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connnectDB();

    const validUser = await User.findOne({ email }).select("+password");
    if (!validUser) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, validUser.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }
    return NextResponse.json({ message: "Login successful" }, { status: 200 });

  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
