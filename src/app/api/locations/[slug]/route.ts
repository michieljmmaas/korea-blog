import { GeoDataService } from '@/lib/geoService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    const locations = await GeoDataService.getLocationsByDate(slug);
    
    return NextResponse.json({
      locations,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations', success: false },
      { status: 500 }
    );
  }
}