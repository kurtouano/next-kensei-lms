// app/api/health/route.js
import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/mongodb';

export async function GET() {
  const startTime = Date.now();
  
  try {
    await connectDb();
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message 
    }, { status: 500 });
  }
}