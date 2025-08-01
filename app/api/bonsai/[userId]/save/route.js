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
        level: user.getBonsaiLevel(),
        totalCredits: user.credits || 0,
        milestones: defaultMilestones,
        customization: {
          eyes: 'default_eyes',
          mouth: 'default_mouth',
          foliageColor: '#77DD82',
          potStyle: 'traditional-blue',
          potColor: '#FD9475',
          foundation: 'shadow',
          decorations: []
        },
        ownedItems: defaultOwnedItems
      });
    }

    // Update customization preferences
    if (updates.customization) {
      // Merge the customization updates
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

    // Update bonsai level and milestones based on user's current credits
    bonsai.totalCredits = user.credits;
    bonsai.updateLevel(); // This method updates level and milestones

    bonsai.updatedAt = new Date();
    await bonsai.save();

    console.log('Bonsai saved successfully:', bonsai);

    return NextResponse.json({ 
      message: "Bonsai preferences saved successfully", 
      bonsai: {
        ...bonsai.toObject(),
        // Include some helpful computed values
        nextLevelCredits: bonsai.level < 3 ? (bonsai.level === 1 ? 200 : 800) : null
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error saving bonsai preferences:', error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}