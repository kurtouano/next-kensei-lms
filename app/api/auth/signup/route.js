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
      credits: 150, // Give new users 150 initial credits
      lifetimeCredits: 150, // Track lifetime credits earned
    });

    // Create bonsai with proper defaults
    const defaultMilestones = Bonsai.getDefaultMilestones();
    const defaultOwnedItems = Bonsai.getDefaultOwnedItems();
    
    const bonsai = await Bonsai.create({ 
      userRef: createUser._id,
      level: 1,
      totalCredits: 150, // Match user's initial lifetime credits
      milestones: defaultMilestones,
      customization: {
        eyes: 'default_eyes',
        mouth: 'default_mouth',
        foliageColor: '#77DD82',
        potStyle: 'default_pot',
        potColor: '#FD9475',
        groundStyle: 'default_ground',
        decorations: []
      },
      ownedItems: defaultOwnedItems
    });
    
    createUser.bonsai = bonsai._id;
    await createUser.save();
    
    return NextResponse.json({ message: "User is Registered" }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}