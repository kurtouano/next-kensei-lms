import ShopItem from '@/models/ShopItem';
import Course from '@/models/Course';
import { connectDb } from "@/lib/mongodb"
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
      await connectDb();

      const usedItems = await Course.distinct("itemsReward"); // Get all distinct items used in courses
      const shopItems = await ShopItem.find({_id: { $nin: usedItems },}); // Not in usedItems

      if (!shopItems || shopItems.length === 0) {
        return NextResponse.json({ error: "No shop items found" }, { status: 404 });
      }
      console.log("Shop items fetched successfully:", shopItems);

      return NextResponse.json(shopItems, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}