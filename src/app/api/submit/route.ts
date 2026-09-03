import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // URL ของ Google Apps Script ที่ผู้ใช้ได้มา
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwFPV3I-z4zGlJrl2bFoKAFSSWLaK4a2GhADC05GY_vA7kscQb2Sy5v1Z6-lFXNS1mY/exec';

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('Google returned non-JSON response:', responseText);
      throw new Error(`Google Web App returned HTML instead of JSON. Please check your Apps Script deployment settings (Must be "Anyone").`);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ status: 'error', message: error.message || 'Failed to submit data' }, { status: 500 });
  }
}

export const maxDuration = 60;
