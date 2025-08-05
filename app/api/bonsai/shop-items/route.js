import { NextResponse } from 'next/server';
import { getAllShopItems, getPurchasableItems, getItemsByCategory } from '@/components/bonsai/shopItems';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const purchasableOnly = searchParams.get('purchasable') === 'true';
    const userOwnedItems = searchParams.get('owned')?.split(',') || [];

    let items;

    if (category) {
      // Get items by specific category
      items = getItemsByCategory(category);
    } else if (purchasableOnly) {
      // Get only purchasable items (excludes free/unlocked items and owned items)
      items = getPurchasableItems(userOwnedItems);
    } else {
      // Get all shop items
      items = getAllShopItems();
    }

    return NextResponse.json({
      items,
      total: items.length,
      categories: ['eyes', 'mouths', 'ground', 'pot', 'decoration']
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching shop items:', error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}