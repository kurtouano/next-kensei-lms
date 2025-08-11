// app/api/bonsai/[userId]/save/route.js
import Bonsai from '@/models/Bonsai';
import User from '@/models/User';
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { getLevelInfo } from '@/lib/levelCalculator';
import { validateDecorationSubcategories, getDecorationSubcategories } from '@/components/bonsai/shopItems';

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
          decorations: validateDecorationSubcategories({})
        },
        ownedItems: defaultOwnedItems
      });
    }

    // ✅ UPDATED: Handle customization with decoration subcategories
    if (updates.customization) {
      // Handle legacy decoration array migration
      if (updates.customization.decorations) {
        if (Array.isArray(updates.customization.decorations)) {
          // Migrate legacy array to subcategory structure
          const legacyDecorations = updates.customization.decorations;
          const migratedDecorations = { hats: null, ambient: null, background: null };
          
          // Simple migration logic - assign first decoration to hats if it exists
          if (legacyDecorations.length > 0) {
            // You can add more sophisticated logic here based on decoration IDs
            const firstDecoration = legacyDecorations[0];
            if (firstDecoration.includes('hat') || firstDecoration.includes('crown') || firstDecoration.includes('cap')) {
              migratedDecorations.hats = firstDecoration;
            } else if (firstDecoration.includes('ambient') || firstDecoration.includes('sparkle') || firstDecoration.includes('firefly')) {
              migratedDecorations.ambient = firstDecoration;
            } else if (firstDecoration.includes('background') || firstDecoration.includes('sunset') || firstDecoration.includes('forest')) {
              migratedDecorations.background = firstDecoration;
            } else {
              // Default to hats for unknown decorations
              migratedDecorations.hats = firstDecoration;
            }
          }
          
          updates.customization.decorations = migratedDecorations;
        }
      }

      // Ensure decorations structure is correct using validation helper
      if (!updates.customization.decorations || Array.isArray(updates.customization.decorations)) {
        updates.customization.decorations = validateDecorationSubcategories(updates.customization.decorations);
      } else {
        updates.customization.decorations = validateDecorationSubcategories(updates.customization.decorations);
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