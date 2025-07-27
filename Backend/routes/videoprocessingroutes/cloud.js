const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Function to upload entire HLS folder structure to S3
const uploadToS3 = async (localFolderPath, s3FolderPath) => {
  try {
    console.log(`[S3 UPLOAD] Starting upload from ${localFolderPath} to s3://${BUCKET_NAME}/${s3FolderPath}`);

    const uploadPromises = [];

    // Function to recursively get all files in directory
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

    // Get all files in the HLS directory
    const allFiles = getAllFiles(localFolderPath);
    console.log(`[S3 UPLOAD] Found ${allFiles.length} files to upload`);

    // Upload each file
    for (const filePath of allFiles) {
      const relativePath = path.relative(localFolderPath, filePath);
      const s3Key = `${s3FolderPath}/${relativePath}`.replace(/\\/g, '/'); // Handle Windows paths

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

      const fileContent = fs.readFileSync(filePath);
      const contentType = getContentType(filePath);

      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileContent,
        ContentType: contentType,
        // Set appropriate cache headers for HLS files
        CacheControl: contentType === 'application/vnd.apple.mpegurl' ? 'no-cache' : 'max-age=31536000'
      };

      const uploadPromise = s3.upload(uploadParams).promise()
        .then((data) => {
          console.log(`[S3 UPLOAD] Uploaded: ${s3Key}`);
          return { success: true, key: s3Key, location: data.Location };
        })
        .catch((error) => {
          console.error(`[S3 UPLOAD ERROR] Failed to upload ${s3Key}:`, error);
          return { success: false, key: s3Key, error: error.message };
        });

      uploadPromises.push(uploadPromise);
    }

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);

    // Check results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`[S3 UPLOAD] Upload complete: ${successful.length} successful, ${failed.length} failed`);

    if (failed.length > 0) {
      console.error('[S3 UPLOAD] Failed uploads:', failed);
      throw new Error(`Failed to upload ${failed.length} files to S3`);
    }

    // Return the S3 URL for the master playlist
    const masterPlaylistUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${s3FolderPath}/master.m3u8`;

    console.log('[S3 UPLOAD] All files uploaded successfully');
    console.log('[S3 UPLOAD] Master playlist URL:', masterPlaylistUrl);

    return {
      success: true,
      masterPlaylistUrl,
      uploadedFiles: successful.length,
      s3Path: s3FolderPath
    };

  } catch (error) {
    console.error('[S3 UPLOAD ERROR]', error);
    throw error;
  }
};

// Function to clean up local files after successful S3 upload
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

// Modified processVideo function - add this at the end before returning
// Replace the existing return statement in your processVideo function with this:

/*
// After generating master playlist, upload to S3
console.log('\n[S3] Uploading to AWS S3...');
const s3FolderPath = `hls-videos/${videoName}`; // S3 folder structure
const s3Result = await uploadToS3(outputDir, s3FolderPath);

// Cleanup local files after successful upload
console.log('[CLEANUP] Removing local HLS files...');
cleanupLocalFiles(outputDir);

// Cleanup original uploaded file
if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
}

console.log('[COMPLETE] S3 Master playlist URL:', s3Result.masterPlaylistUrl);
return {
  masterUrl: s3Result.masterPlaylistUrl,
  s3Path: s3Result.s3Path,
  uploadedFiles: s3Result.uploadedFiles
};
*/

module.exports = {
  uploadToS3,
  cleanupLocalFiles
};
