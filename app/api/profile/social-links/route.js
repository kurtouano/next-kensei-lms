import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDb } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { socialLinks } = await request.json();

    if (!Array.isArray(socialLinks)) {
      return NextResponse.json({ success: false, message: 'Invalid social links data' }, { status: 400 });
    }

    // Validate social links
    for (const link of socialLinks) {
      if (!link.platform || !link.url || !link.id) {
        return NextResponse.json({ success: false, message: 'Invalid social link format' }, { status: 400 });
      }
      
      // Basic URL validation - allow URLs without protocol
      try {
        let urlToValidate = link.url;
        // If URL doesn't start with http:// or https://, add https://
        if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
          urlToValidate = 'https://' + urlToValidate;
        }
        new URL(urlToValidate);
      } catch {
        return NextResponse.json({ success: false, message: 'Invalid URL format' }, { status: 400 });
      }
    }

    await connectDb();

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { socialLinks },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Social links updated successfully',
      socialLinks: user.socialLinks 
    });

  } catch (error) {
    console.error('Error updating social links:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update social links',
      error: error.message 
    }, { status: 500 });
  }
}
