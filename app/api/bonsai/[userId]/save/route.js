// app/api/bonsai/[userId]/save/route.js
import Bonsai from '@/models/Bonsai';
import User from '@/models/User';
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function PUT(request, { params }) {
  try {
    await connectDb();
    const { userId } = await params;
    const updates = await request.json();

    // Verify user is authenticated and can access this bonsai
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find bonsai for user
    const bonsai = await Bonsai.findOne({ userRef: userId });
    if (!bonsai) {
      return NextResponse.json({ error: "Bonsai not found" }, { status: 404 });
    }

    // Update customization preferences
    if (updates.customization) {
      bonsai.customization = {
        ...bonsai.customization,
        ...updates.customization
      };
    }

    // Update owned items if provided
    if (updates.ownedItems) {
      bonsai.ownedItems = [...new Set([...bonsai.ownedItems, ...updates.ownedItems])];
    }

    bonsai.updatedAt = new Date();
    await bonsai.save();

    return NextResponse.json({ 
      message: "Bonsai preferences saved successfully", 
      bonsai 
    }, { status: 200 });
  } catch (error) {
    console.error('Error saving bonsai preferences:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}