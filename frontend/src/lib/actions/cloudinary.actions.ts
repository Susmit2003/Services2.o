'use server';

import { v2 as cloudinary } from 'cloudinary';
import { revalidatePath } from 'next/cache';

// --- This part is your correct configuration logic ---
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// These checks are excellent for ensuring your environment variables are set.
if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Cloudinary environment variables are not configured. Please set them in your .env.local file.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});
// --- End of your configuration logic ---


/**
 * @desc    Uploads an image to Cloudinary
 * @param   formData - The FormData object containing the file to upload
 * @param   path - The path of the page to revalidate after upload
 * @returns An object with the secure URL of the uploaded image or an error.
 */
export async function uploadImage(formData: FormData, path: string): Promise<{ secure_url: string } | { error: string }> {
  try {
    const file = formData.get('image') as File | null;

    if (!file) {
      return { error: 'No image file provided.' };
    }

    // Convert the file to a buffer to upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the image buffer to Cloudinary
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'user_profiles', // Optional: organize uploads into folders
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      ).end(buffer);
    });

    if (path) {
        revalidatePath(path);
    }
    
    return { secure_url: uploadResult.secure_url };

  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return { error: "Image upload failed. Please try again." };
  }
}