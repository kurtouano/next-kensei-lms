// app/api/bonsai/[userId]/save/route.js
import Bonsai from '@/models/Bonsai';
import User from '@/models/User';
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { getLevelInfo } from '@/lib/levelCalculator';

export async function PUT(request, { params }) {
  try {
    await connectDb();
    const { userId } = await params;
    const updates = await request.json();

    console.log('Save request received for user:', userId);
    console.log('Updates:', updates);

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
    let bonsai = await Bonsai.findOne({ userRef: userId });
    if (!bonsai) {
      // Create bonsai if it doesn't exist
      const defaultMilestones = Bonsai.getDefaultMilestones();
      const defaultOwnedItems = Bonsai.getDefaultOwnedItems();

      bonsai = new Bonsai({
        userRef: userId,
        totalCredits: user.credits || 0,
        milestones: defaultMilestones,
        customization: {
          eyes: 'default_eyes',
          mouth: 'default_mouth',
          foliageColor: '#77DD82',
          potStyle: 'traditional-blue',
          potColor: '#FD9475',
          groundStyle: 'default_ground',
          decorations: []
        },
        ownedItems: defaultOwnedItems
      });
    }

    // Update customization preferences
    if (updates.customization) {

      bonsai.customization = {
        ...bonsai.customization,
        ...updates.customization
      };
      
      console.log('Updated customization:', bonsai.customization);
    }

    // Update owned items if provided
    if (updates.ownedItems) {
      bonsai.ownedItems = [...new Set([...bonsai.ownedItems, ...updates.ownedItems])];
    }

    bonsai.syncWithUserCredits(user.credits);

    bonsai.updatedAt = new Date();
    await bonsai.save();

    const levelInfo = getLevelInfo(user.credits);
    const response = {
      message: "Bonsai preferences saved successfully", 
      bonsai: {
        ...bonsai.toObject(), // Includes virtual 'level' field
        levelInfo, // Additional level information
      }
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error saving bonsai preferences:', error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}