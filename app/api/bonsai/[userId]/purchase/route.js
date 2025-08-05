// app/api/bonsai/[userId]/purchase/route.js
import Bonsai from '@/models/Bonsai';
import User from '@/models/User';
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

    // Validate input
    if (!itemKey || typeof itemCredits !== 'number') {
      return NextResponse.json({ error: "Invalid item data" }, { status: 400 });
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

    // ✅ NEW: Validate item exists in our item catalog
    const allItems = Bonsai.getItemsByCategory();
    const allItemIds = [
      ...allItems.eyes.map(item => item.id),
      ...allItems.mouths.map(item => item.id),
      ...allItems.foliage.map(item => item.id),
      ...allItems.pots.map(item => item.id),
      ...allItems.potColors.map(item => item.id),
      ...allItems.grounds.map(item => item.id),
      ...allItems.decorations.map(item => item.id)
    ];

    if (!allItemIds.includes(itemKey)) {
      return NextResponse.json({ error: "Invalid item" }, { status: 400 });
    }

    // ✅ NEW: Additional validation - check if item should be purchasable
    const purchasableItems = [
      ...allItems.foliage.filter(item => !item.unlocked),
      ...allItems.pots.filter(item => !item.unlocked), 
      ...allItems.potColors.filter(item => !item.unlocked),
      ...allItems.grounds.filter(item => !item.unlocked),
      ...allItems.decorations.filter(item => !item.unlocked)
    ];

    const itemToPurchase = purchasableItems.find(item => item.id === itemKey);
    if (!itemToPurchase) {
      return NextResponse.json({ error: "Item is not purchasable" }, { status: 400 });
    }

    // Verify credit cost matches
    if (itemToPurchase.credits !== itemCredits) {
      return NextResponse.json({ error: "Credit cost mismatch" }, { status: 400 });
    }

    // Perform the purchase transaction
    try {
      // Deduct credits from user
      user.credits -= itemCredits;
      await user.save();

      // Add item to owned items
      bonsai.ownedItems.push(itemKey);
      bonsai.updatedAt = new Date();
      await bonsai.save();

      console.log(`User ${userId} purchased ${itemKey} for ${itemCredits} credits`);

      return NextResponse.json({ 
        message: "Item purchased successfully",
        remainingCredits: user.credits,
        ownedItems: bonsai.ownedItems,
        purchasedItem: {
          id: itemKey,
          name: itemToPurchase.name,
          credits: itemCredits,
          category: itemToPurchase.category || 'unknown'
        }
      }, { status: 200 });

    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
    }

  } catch (error) {
    console.error('Error purchasing item:', error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}