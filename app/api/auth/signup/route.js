import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import User from "@/models/User.js";
import Bonsai from "@/models/Bonsai.js";
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

    const createUser = await User.create({ // Create new user in DB credentials/google
      name,
      email,
      password: hashedPassword,
      provider,
      providerId,
    });

    const bonsai = await Bonsai.create({ userRef: createUser._id });
    createUser.bonsai = bonsai._id;
    await createUser.save();
    return NextResponse.json({ message: "User is Registered" }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

