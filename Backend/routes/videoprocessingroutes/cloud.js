const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK for MinIO
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.MINIO_BROWSER_REDIRECT_URL,
  s3ForcePathStyle: true, // Required for MinIO
  signatureVersion: 'v4'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Function to upload entire HLS folder structure to MinIO
const uploadToMinIO = async (localFolderPath, s3FolderPath) => {
  try {
    console.log(`[MINIO UPLOAD] Starting upload from ${localFolderPath} to minio://${BUCKET_NAME}/${s3FolderPath}`);

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
    console.log(`[MINIO UPLOAD] Found ${allFiles.length} files to upload`);

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
          console.log(`[MINIO UPLOAD] Uploaded: ${s3Key}`);
          return { success: true, key: s3Key, location: data.Location };
        })
        .catch((error) => {
          console.error(`[MINIO UPLOAD ERROR] Failed to upload ${s3Key}:`, error);
          return { success: false, key: s3Key, error: error.message };
        });

      uploadPromises.push(uploadPromise);
    }

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);

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

// Modified processVideo function - add this at the end before returning
// Replace the existing return statement in your processVideo function with this:

/*
// After generating master playlist, upload to MinIO
console.log('\n[MINIO] Uploading to MinIO...');
const s3FolderPath = `hls-videos/${videoName}`; // MinIO folder structure
const minioResult = await uploadToMinIO(outputDir, s3FolderPath);

// Cleanup local files after successful upload
console.log('[CLEANUP] Removing local HLS files...');
cleanupLocalFiles(outputDir);

// Cleanup original uploaded file
if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
}

console.log('[COMPLETE] MinIO Master playlist URL:', minioResult.masterPlaylistUrl);
return {
  masterUrl: minioResult.masterPlaylistUrl,
  s3Path: minioResult.s3Path,
  uploadedFiles: minioResult.uploadedFiles
};
*/

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
