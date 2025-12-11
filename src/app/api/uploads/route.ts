import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, url } = body;
    if (!data && !url) return NextResponse.json({ error: 'Missing image data' }, { status: 400 });

    // Cloudinary accepts data URLs or remote URLs
    const uploadTarget = data || url;
    const res = await cloudinary.uploader.upload(uploadTarget, {
      folder: 'ecommerce_products',
      transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
    });

    return NextResponse.json({ url: res.secure_url, raw: res });
  } catch (err: any) {
    console.error('uploads POST error', err);
    return NextResponse.json({ error: err.message || 'Upload error' }, { status: 500 });
  }
}
