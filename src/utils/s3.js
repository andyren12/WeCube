import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

// Debug logging
console.log('S3 Config:', {
  region: import.meta.env.VITE_AWS_REGION,
  bucketName: import.meta.env.VITE_S3_BUCKET_NAME,
  hasAccessKey: !!import.meta.env.VITE_AWS_ACCESS_KEY_ID,
  hasSecretKey: !!import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
});

/**
 * Upload a file to S3 bucket
 * @param {File} file - The file to upload
 * @param {string} listingId - Listing ID for organizing files
 * @returns {Promise<string>} The S3 key (path) of the uploaded file
 */
export async function uploadImageToS3(file, listingId) {
  // Generate unique filename with timestamp
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

  // Organize files by listing only
  const s3Key = `listings/${listingId}/${fileName}`;

  // Convert File to ArrayBuffer for browser compatibility
  const fileBuffer = await file.arrayBuffer();

  const uploadParams = {
    Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
    Key: s3Key,
    Body: new Uint8Array(fileBuffer),
    ContentType: file.type,
    // Private access - requires authentication to view
    ACL: 'private',
    Metadata: {
      'original-name': file.name,
      'listing-id': listingId,
    },
  };

  try {
    console.log('Uploading file:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      s3Key,
      bucket: import.meta.env.VITE_S3_BUCKET_NAME
    });

    const command = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(command);

    console.log(`File uploaded successfully: ${s3Key}`, result);
    return s3Key;
  } catch (error) {
    console.error('Detailed S3 upload error:', {
      error,
      errorMessage: error.message,
      errorCode: error.Code,
      errorName: error.name,
      uploadParams
    });
    throw new Error(`Failed to upload ${file.name}: ${error.message}`);
  }
}

/**
 * Upload multiple images to S3
 * @param {Array<File>} files - Array of files to upload
 * @param {string} listingId - Listing ID
 * @returns {Promise<Array<string>>} Array of S3 keys
 */
export async function uploadMultipleImages(files, listingId) {
  const uploadPromises = files.map(file => uploadImageToS3(file, listingId));

  try {
    const s3Keys = await Promise.all(uploadPromises);
    return s3Keys;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
}