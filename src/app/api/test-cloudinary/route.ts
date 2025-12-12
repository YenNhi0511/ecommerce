import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET() {
  try {
    console.log('🧪 Testing Cloudinary...');
    console.log('Env vars:', {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? '✓' : '✗',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '✓' : '✗',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '✓' : '✗',
    });

    // Try to upload a test image
    const testImageUrl = 'https://via.placeholder.com/300x300?text=Test';
    console.log('🖼️ Uploading test image from:', testImageUrl);
    
    const cloudinaryUrl = await uploadToCloudinary(testImageUrl);
    console.log('✅ Upload successful:', cloudinaryUrl);

    return NextResponse.json({ 
      success: true,
      message: 'Cloudinary is working!',
      imageUrl: cloudinaryUrl,
      envVars: {
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '***' : 'NOT SET',
      }
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      envVars: {
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '***' : 'NOT SET',
      }
    }, { status: 500 });
  }
}
