import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const zipCode = searchParams.get('zip');

  console.log('[Geocode API] Request received for ZIP:', zipCode);

  if (!zipCode || !/^\d{5}$/.test(zipCode)) {
    console.log('[Geocode API] Invalid ZIP code format:', zipCode);
    return NextResponse.json(
      { error: 'Invalid ZIP code format' },
      { status: 400 }
    );
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&postalcode=${zipCode}&limit=1`;
    console.log('[Geocode API] Fetching from Nominatim:', nominatimUrl);

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Victory-Garden-Map/1.0',
      },
    });

    console.log('[Geocode API] Nominatim response status:', response.status);

    if (!response.ok) {
      console.error('[Geocode API] Nominatim error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Geocoding service unavailable' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Geocode API] Nominatim returned', data.length, 'results');

    if (data.length > 0) {
      console.log('[Geocode API] First result:', {
        lat: data[0].lat,
        lon: data[0].lon,
        display_name: data[0].display_name
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Geocode API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch geocoding data' },
      { status: 500 }
    );
  }
}
