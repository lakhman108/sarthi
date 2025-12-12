const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK for MinIO with improved settings
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.MINIO_ENDPOINT || process.env.MINIO_BROWSER_REDIRECT_URL,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: 'us-east-1',
  httpOptions: {
    timeout: 300000, // 5 minutes timeout
    connectTimeout: 60000 // 1 minute connection timeout
  },
  maxRetries: 3,
  retryDelayOptions: {
    base: 2000 // 2 second base delay between retries
  }
});

console.log('[MINIO CONFIG] Endpoint:', process.env.MINIO_ENDPOINT || process.env.MINIO_BROWSER_REDIRECT_URL);
console.log('[MINIO CONFIG] Bucket:', process.env.AWS_S3_BUCKET_NAME);

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Helper function to get all files recursively
const getAllFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
};

// Determine content type based on file extension
const getContentType = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.m3u8': return 'application/vnd.apple.mpegurl';
    case '.ts': return 'video/mp2t';
    case '.mp4': return 'video/mp4';
    default: return 'application/octet-stream';
  }
};

// Upload a single file with proper error handling
const uploadSingleFile = async (filePath, s3Key) => {
  try {
    const fileStream = fs.createReadStream(filePath);
    const contentType = getContentType(filePath);

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileStream,
      ContentType: contentType,
      CacheControl: contentType === 'application/vnd.apple.mpegurl' ? 'no-cache' : 'max-age=31536000'
    };

    const data = await s3.upload(uploadParams).promise();
    return { success: true, key: s3Key, location: data.Location };
  } catch (error) {
    console.error(`[MINIO UPLOAD ERROR] Failed to upload ${s3Key}:`, error.message);
    return { success: false, key: s3Key, error: error.message };
  }
};

// Function to upload files in controlled batches
const uploadToMinIO = async (localFolderPath, s3FolderPath) => {
  try {
    console.log(`[MINIO UPLOAD] Starting upload from ${localFolderPath} to minio://${BUCKET_NAME}/${s3FolderPath}`);

    // Get all files to upload
    const allFiles = getAllFiles(localFolderPath);
    console.log(`[MINIO UPLOAD] Found ${allFiles.length} files to upload`);

    // Upload in batches to avoid overwhelming the server
    const BATCH_SIZE = 3; // Upload 3 files at a time
    const DELAY_BETWEEN_BATCHES = 500; // 500ms delay between batches
    const results = [];

    // Process files in batches
    for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
      const batch = allFiles.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(allFiles.length / BATCH_SIZE);
      
      console.log(`[MINIO UPLOAD] Processing batch ${batchNumber}/${totalBatches} (${batch.length} files)`);

      // Upload current batch concurrently
      const batchPromises = batch.map(filePath => {
        const relativePath = path.relative(localFolderPath, filePath);
        const s3Key = `${s3FolderPath}/${relativePath}`.replace(/\\/g, '/');
        return uploadSingleFile(filePath, s3Key);
      });

      const batchResults = await Promise.all(batchPromises);
      
      // Log individual results
      batchResults.forEach(result => {
        if (result.success) {
          console.log(`[MINIO UPLOAD] ✓ Uploaded: ${result.key}`);
        } else {
          console.error(`[MINIO UPLOAD] ✗ Failed: ${result.key} - ${result.error}`);
        }
      });

      results.push(...batchResults);

      // Add delay between batches (except for the last batch)
      if (i + BATCH_SIZE < allFiles.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    // Check results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`[MINIO UPLOAD] Upload complete: ${successful.length} successful, ${failed.length} failed`);

    if (failed.length > 0) {
      console.error('[MINIO UPLOAD] Failed uploads:', failed);
      throw new Error(`Failed to upload ${failed.length} files to MinIO`);
    }

    // Return the MinIO URL for the master playlist
    const masterPlaylistUrl = `${process.env.MINIO_BROWSER_REDIRECT_URL}/${BUCKET_NAME}/${s3FolderPath}/master.m3u8`;
    console.log('[MINIO UPLOAD] All files uploaded successfully');
    console.log('[MINIO UPLOAD] Master playlist URL:', masterPlaylistUrl);

    return {
      success: true,
      masterPlaylistUrl,
      uploadedFiles: successful.length,
      s3Path: s3FolderPath
    };

  } catch (error) {
    console.error('[MINIO UPLOAD ERROR]', error);
    throw error;
  }
};

// Function to clean up local files after successful MinIO upload
const cleanupLocalFiles = (localFolderPath) => {
  try {
    if (fs.existsSync(localFolderPath)) {
      fs.rmSync(localFolderPath, { recursive: true, force: true });
      console.log(`[CLEANUP] Removed local folder: ${localFolderPath}`);
    }
  } catch (error) {
    console.error('[CLEANUP ERROR]', error);
  }
};

// Function to delete all objects in a folder from MinIO
const deleteFromMinIO = async (s3FolderPath) => {
  try {
    console.log(`[MINIO DELETE] Starting deletion of folder: ${s3FolderPath}`);

    // List all objects in the folder
    const listParams = {
      Bucket: BUCKET_NAME,
      Prefix: s3FolderPath
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (listedObjects.Contents.length === 0) {
      console.log('[MINIO DELETE] No objects found to delete');
      return;
    }

    // Prepare objects for deletion
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Delete: { Objects: [] }
    };

    listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
    });

    // Delete objects
    await s3.deleteObjects(deleteParams).promise();
    console.log(`[MINIO DELETE] Successfully deleted ${listedObjects.Contents.length} objects`);

    // Recursively delete if there are more objects (pagination)
    if (listedObjects.IsTruncated) {
      await deleteFromMinIO(s3FolderPath);
    }
  } catch (error) {
    console.error('[MINIO DELETE ERROR]', error);
    // Don't throw error to allow lecture deletion to proceed even if MinIO deletion fails
  }
};

module.exports = {
  uploadToMinIO,
  cleanupLocalFiles,
  deleteFromMinIO
};