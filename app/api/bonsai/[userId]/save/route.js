// app/api/bonsai/[userId]/save/route.js
import Bonsai from '@/models/Bonsai';
import User from '@/models/User';
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { getLevelInfo } from '@/lib/levelCalculator';
// Removed decoration subcategory imports - now using independent hat/background structure

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
          potStyle: 'default_pot',
          potColor: '#FD9475',
          groundStyle: 'default_ground',
          hat: null,
          background: null
        },
        ownedItems: defaultOwnedItems
      });
    }

    // ✅ UPDATED: Handle customization with independent hat/background structure
    if (updates.customization) {
      // Handle legacy decoration migration
      if (updates.customization.decorations) {
        // Migrate from old decorations structure to new independent structure
        if (typeof updates.customization.decorations === 'object' && !Array.isArray(updates.customization.decorations)) {
          // Old subcategory structure
          updates.customization.hat = updates.customization.decorations.hats || null;
          updates.customization.background = updates.customization.decorations.background || null;
        } else if (Array.isArray(updates.customization.decorations)) {
          // Old array structure - migrate first item to hat if it looks like a hat
          const legacyDecorations = updates.customization.decorations;
          if (legacyDecorations.length > 0) {
            const firstDecoration = legacyDecorations[0];
            if (firstDecoration.includes('hat') || firstDecoration.includes('crown') || firstDecoration.includes('cap')) {
              updates.customization.hat = firstDecoration;
            } else if (firstDecoration.includes('background') || firstDecoration.includes('sunset') || firstDecoration.includes('forest')) {
              updates.customization.background = firstDecoration;
            }
          }
        }
        // Remove old decorations field
        delete updates.customization.decorations;
      }

      bonsai.customization = {
        ...bonsai.customization,
        ...updates.customization
      };
    }

    // Update owned items if provided
    if (updates.ownedItems) {
      bonsai.ownedItems = [...new Set([...bonsai.ownedItems, ...updates.ownedItems])];
    }

    // Sync with user credits and update milestones
    bonsai.syncWithUserCredits(user.credits);

    bonsai.updatedAt = new Date();
    await bonsai.save();

    // Update user to reference the bonsai record
    await User.findByIdAndUpdate(userId, { bonsai: bonsai._id });

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