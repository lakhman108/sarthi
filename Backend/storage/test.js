const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Debug environment variables
console.log('Checking credentials:', {
  accountId: process.env.Account_ID?.substring(0, 5) + '...',
  accessKey: process.env.Access_Key_ID?.substring(0, 5) + '...',
  secretKey: process.env.Secret_Access_Key?.substring(0, 5) + '...'
});

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.Account_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.Access_Key_ID,
    secretAccessKey: process.env.Secret_Access_Key
  },
  forcePathStyle: true // Required for R2
});

async function uploadToR2(bucket, key, body, contentType) {
  try {
    console.log(`Attempting to upload ${key} to bucket ${bucket}`);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType
    });

    const response = await r2.send(command);
    console.log('Upload successful:', response);
    return response;
  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      code: error.code,
      requestId: error.$metadata?.requestId
    });
    throw error;
  }
}

// Test upload
//1.we will get folder name
//2.there will be folder inside folder
//recuresivly visit all the files and upload
//determine type and send it to cloudflare

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    '.m3u8': 'application/vnd.apple.mpegurl',
    '.ts': 'video/MP2T',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png'
  };
  return contentTypes[ext] || 'application/octet-stream';
}


function getAllFiles(dirPath, arrayOfFiles = []) {
  fs.readdir(dirPath,(err,files)=>{
    if (err) {
    console.error('Error reading directory:', err);
    return;
  }
  console.log('Files and folders in the directory:', files);
  })
  // TODO: Read directory contents
  // TODO: For each item in directory:
  //   - If it's a file, add to array
  //   - If it's a directory, recurse into it
  // TODO: Return array of file paths
}
async () => {
  try {
    const localFilePath = path.join(__dirname, '../public/hls/whatsapp-video-2025-05-13-at-091432/master.m3u8');
    console.log('Reading file from:', localFilePath);

    const fileBuffer = fs.readFileSync(localFilePath);
    const r2Key = 'hls/whatsapp-video-2025-05-13-at-091432/master.m3u8';

    await uploadToR2('sarthi-videos', r2Key, fileBuffer, 'application/vnd.apple.mpegurl');
    console.log('Upload complete!');
  } catch (error) {
    console.error('Test upload failed:', error.message);
  }
}
