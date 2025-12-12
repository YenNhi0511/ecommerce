import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'NOT SET',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'NOT SET',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'NOT SET',
});

export async function uploadToCloudinary(imageUrl: string): Promise<string> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      throw new Error('Cloudinary credentials not configured. Check .env file.');
    }
    
    // First check if image URL is accessible
    const response = await fetch(imageUrl, { method: 'HEAD' });
    if (!response.ok) {
      console.warn(`⚠️ Image URL not accessible (${response.status}): ${imageUrl}`);
      // Use placeholder image instead
      const placeholderUrl = 'https://via.placeholder.com/600x600/cccccc/666666?text=Product+Image';
      const result = await cloudinary.uploader.upload(placeholderUrl, {
        folder: 'tmdt_ecommerce',
        resource_type: 'auto',
      });
      return result.secure_url;
    }
    
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'tmdt_ecommerce',
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Return placeholder instead of throwing
    const placeholderUrl = 'https://via.placeholder.com/600x600/cccccc/666666?text=No+Image';
    try {
      const result = await cloudinary.uploader.upload(placeholderUrl, {
        folder: 'tmdt_ecommerce',
        resource_type: 'auto',
      });
      return result.secure_url;
    } catch {
      // If even placeholder fails, return original URL
      return imageUrl;
    }
  }
}

export { cloudinary };
