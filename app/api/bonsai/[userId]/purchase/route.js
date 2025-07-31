// app/api/bonsai/[userId]/purchase/route.js
import Bonsai from '@/models/Bonsai';
import User from '@/models/User';
import ShopItem from '@/models/ShopItem';
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(request, { params }) {
  try {
    await connectDb();
    const { userId } = await params;
    const { itemKey, itemCredits } = await request.json();

    // Verify user is authenticated and can access this bonsai
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user and bonsai
    const user = await User.findById(userId);
    const bonsai = await Bonsai.findOne({ userRef: userId });

    if (!user || !bonsai) {
      return NextResponse.json({ error: "User or Bonsai not found" }, { status: 404 });
    }

    // Check if user has enough credits
    if (user.credits < itemCredits) {
      return NextResponse.json({ error: "Not enough credits" }, { status: 400 });
    }

    // Check if item is already owned
    if (bonsai.ownedItems.includes(itemKey)) {
      return NextResponse.json({ error: "Item already owned" }, { status: 400 });
    }

    // Deduct credits from user
    user.credits -= itemCredits;
    await user.save();

    // Add item to owned items
    bonsai.ownedItems.push(itemKey);
    bonsai.updatedAt = new Date();
    await bonsai.save();

    return NextResponse.json({ 
      message: "Item purchased successfully",
      remainingCredits: user.credits,
      ownedItems: bonsai.ownedItems
    }, { status: 200 });
  } catch (error) {
    console.error('Error purchasing item:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}