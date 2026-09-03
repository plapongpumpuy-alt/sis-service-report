import { NextResponse } from 'next/server';

export const revalidate = 0; // Disable caching

export async function GET() {
  try {
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwFPV3I-z4zGlJrl2bFoKAFSSWLaK4a2GhADC05GY_vA7kscQb2Sy5v1Z6-lFXNS1mY/exec';
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('Google returned non-JSON response on GET:', responseText);
      throw new Error(`Google Web App returned HTML instead of JSON.`);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Options Route Error:', error);
    return NextResponse.json({ status: 'error', message: error.message || 'Failed to fetch options' }, { status: 500 });
  }
}
