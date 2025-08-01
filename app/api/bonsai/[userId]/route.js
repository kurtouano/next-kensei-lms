// app/api/bonsai/[userId]/route.js
import Bonsai from '@/models/Bonsai';
import User from '@/models/User';
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// Helper function to determine bonsai level based on credits
function getBonsaiLevel(totalCredits) {
  if (totalCredits < 200) return 1;
  if (totalCredits < 800) return 2;
  return 3;
}

export async function GET(request, { params }) {
  try {
    await connectDb();
    const { userId } = await params;

    // Verify user is authenticated and can access this bonsai
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data to check their total credits
    const user = await User.findById(userId).select('credits');
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find or create bonsai for user
    let bonsai = await Bonsai.findOne({ userRef: userId });
    
    if (!bonsai) {
      // Create default bonsai for new user
      const defaultMilestones = Bonsai.getDefaultMilestones();
      const defaultOwnedItems = Bonsai.getDefaultOwnedItems();

      bonsai = new Bonsai({
        userRef: userId,
        level: getBonsaiLevel(user.credits),
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
      await bonsai.save();
      console.log('Created new bonsai with default items:', defaultOwnedItems);
    } else {
      // Update existing bonsai level and milestones based on current user credits
      const newLevel = getBonsaiLevel(user.credits);
      const updatedMilestones = bonsai.milestones.map(milestone => {
        if (user.credits >= milestone.creditsRequired && !milestone.isAchieved) {
          milestone.isAchieved = true;
          milestone.achievedAt = new Date();
        }
        return milestone;
      });

      // Ensure default items are always included
      const defaultItems = Bonsai.getDefaultOwnedItems();
      const mergedItems = [...new Set([...defaultItems, ...bonsai.ownedItems])];

      bonsai.level = newLevel;
      bonsai.totalCredits = user.credits;
      bonsai.milestones = updatedMilestones;
      bonsai.ownedItems = mergedItems;
      await bonsai.save();
      
      console.log('Updated bonsai with owned items:', mergedItems);
    }

    return NextResponse.json(bonsai, { status: 200 });
  } catch (error) {
    console.error('Error fetching bonsai:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}