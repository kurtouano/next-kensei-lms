// app/api/bonsai/[userId]/route.js
import Bonsai from '@/models/Bonsai';
import User from '@/models/User';
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { calculateBonsaiLevel, getLevelInfo } from '@/lib/levelCalculator';

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
        totalCredits: user.credits || 0,
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
      await bonsai.save();
    } else {
      bonsai.syncWithUserCredits(user.credits);

      const defaultItems = Bonsai.getDefaultOwnedItems();
      const mergedItems = [...new Set([...defaultItems, ...bonsai.ownedItems])];
      bonsai.ownedItems = mergedItems;
      
      await bonsai.save();
    }

    const levelInfo = getLevelInfo(user.credits);

    const response = {
      ...bonsai.toObject(),
      levelInfo, 
      level: levelInfo.level,
      totalCredits: user.credits
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching bonsai:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}