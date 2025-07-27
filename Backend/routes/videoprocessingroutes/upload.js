const express = require('express');
const path = require('path');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const {uploadToS3,cleanupLocalFiles}=require('./cloud.js')

// Option 2: Using Bull with Redis (uncomment if you want to use Redis)
const Queue = require('bull');
const videoProcessingQueue = new Queue('video processing',process.env.REDIS_URL);

const app = express.Router();


// If using Bull with Redis, uncomment this:
videoProcessingQueue.process('process-video',2, async (job) => {
  const { filePath, videoName, outputDir, resolutions } = job.data;
  return await processVideo(filePath, videoName, outputDir, resolutions);
});

const processVideo = async (filePath, videoName, outputDir, resolutions) => {
  try {
    // Create output directories
    createDirectories(outputDir, resolutions);
    console.log('[SETUP] Created output directories in:', outputDir);

    // Configuration for each resolution
    const resolutionConfigs = {
      '240p': { scale: '426:240', bitrate: '800k', maxrate: '856k', bufsize: '1200k' },
      '360p': { scale: '640:360', bitrate: '1400k', maxrate: '1498k', bufsize: '2100k' },
      '720p': { scale: '1280:720', bitrate: '2800k', maxrate: '2996k', bufsize: '4200k' }
    };

    // Process each resolution
    for (const res of resolutions) {
      console.log(`\n[TRANSCODE] Starting ${res} conversion...`);
      const config = resolutionConfigs[res];
      const outputPath = path.join(outputDir, res);

      const ffmpegCommand = `ffmpeg -i "${filePath}" \
        -vf scale=${config.scale} \
        -c:v h264 -profile:v main -preset fast \
        -b:v ${config.bitrate} -maxrate ${config.maxrate} -bufsize ${config.bufsize} \
        -c:a aac -b:a 128k -ac 2 \
        -hls_time 6 \
        -hls_list_size 0 \
        -hls_segment_filename "${outputPath}/segment_%03d.ts" \
        -f hls \
        "${outputPath}/stream_${res}.m3u8"`;

      await new Promise((resolve, reject) => {
        const process = exec(ffmpegCommand);
        let segmentCount = 0;

        // Track progress using segment creation
        const watcher = fs.watch(outputPath, (eventType, filename) => {
          if (eventType === 'rename' && filename && filename.endsWith('.ts')) {
            segmentCount++;
            console.log(`[PROGRESS] ${res}: Created segment #${segmentCount}`);
          }
        });

        process.stderr.on('data', (data) => {
          const output = data.toString();

          // Log time progress if available
          if (output.includes('time=')) {
            const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2}.\d{2})/);
            if (timeMatch) {
              console.log(`[PROGRESS] ${res}: Processing at ${timeMatch[0].replace('time=', '')}`);
            }
          }

          // Log errors
          if (output.includes('Error') || output.includes('failed')) {
            console.error(`[ERROR] ${res}:`, output);
          }
        });

        process.on('error', (error) => {
          console.error(`[ERROR] ${res} process error:`, error);
          watcher.close(); // Close file watcher
          reject(error);
        });

        process.on('exit', (code) => {
          watcher.close(); // Close file watcher
          if (code === 0) {
            console.log(`[SUCCESS] ${res} conversion complete - Created ${segmentCount} segments`);
            resolve();
          } else {
            const error = new Error(`FFmpeg process exited with code ${code}`);
            console.error(`[ERROR] ${res}:`, error.message);
            reject(error);
          }
        });
      });
    }

    // Generate master playlist
    console.log('\n[PLAYLIST] Generating master playlist...');
    generateMasterPlaylist(outputDir, resolutions);

    // Cleanup
    console.log('[CLEANUP] Removing temporary files...');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const masterUrl = `${process.env.HOST}/api/hls/${videoName}/master.m3u8`;
    console.log('[COMPLETE] Master playlist URL:', masterUrl);
    return {
      masterUrl: masterUrl
    };
  } catch (error) {
    console.error('[ERROR] video processing failed', error);
    throw error;
  }
};

// For sanitizing file names
// This function replaces spaces with dashes, removes special characters,
// and ensures the filename is lowercase
const sanitizeFileName = (fileName) => {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.-]/g, '') // Allow dots for file extensions
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Set up multer for file uploads
const storageEngine = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, callback) {
    const sanitizedName = sanitizeFileName(file.originalname);
    console.log('Original filename:', file.originalname);
    console.log('Sanitized filename:', sanitizedName);
    callback(null, sanitizedName);
  },
});

// File filter to only accept specific video file types
const fileFilter = (req, file, callback) => {
  const validTypes = /\.(mp4|mov|m4v)$/i; // Fixed regex
  const isValid = validTypes.test(file.originalname);
  console.log('File validation:', {
    originalName: file.originalname,
    mimeType: file.mimetype,
    isValid
  });

  if (isValid) {
    callback(null, true);
  } else {
    callback(new Error('Invalid file type. Only MP4, MOV, M4V allowed'));
  }
};

// Initialize multer with the storage engine and file filter
const upload = multer({
  storage: storageEngine,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

// Helper function to create directories
const createDirectories = (outputDir, resolutions) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  resolutions.forEach(res => {
    const resPath = `${outputDir}/${res}`;
    if (!fs.existsSync(resPath)) {
      fs.mkdirSync(resPath, { recursive: true });
      console.log(`Created resolution directory: ${resPath}`);
    }
  });
};

// Helper function to generate master playlist
const generateMasterPlaylist = (outputDir, resolutions) => {
  const playlistContent = `#EXTM3U
#EXT-X-VERSION:3
${resolutions.map(res => {
  const [width, height] = res === '240p' ? [426, 240] :
                         res === '360p' ? [640, 360] :
                         [1280, 720];
  const bandwidth = res === '240p' ? 928000 : // Updated bandwidth values
                   res === '360p' ? 1528000 :
                   3328000;
  return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${width}x${height}
${res}/stream_${res}.m3u8`;
}).join('\n')}`;

  fs.writeFileSync(`${outputDir}/master.m3u8`, playlistContent);
  console.log('[PLAYLIST] Master playlist generated successfully');
};

// Endpoint to handle video upload and processing
// This endpoint receives a video file, processes it with ffmpeg,
// and generates HLS streams for different resolutions
// It also generates a master playlist for adaptive streaming
// The processed video files are stored in the public/hls directory
// The endpoint returns the URL of the master playlist

app.post('/', upload.single('uploadedFile'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('[ERROR] No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const jobId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const videoName = `${sanitizeFileName(path.parse(req.file.originalname).name)}_${jobId}`;

    const filePath = req.file.path;
    console.log('[UPLOAD] File received:', filePath);

    console.log('[PROCESS] Sanitized video name:', videoName);

    const outputDir = `./public/hls/${videoName}`;
    const resolutions = ['240p', '360p', '720p'];

    // Add job to queue
    const job = await videoProcessingQueue.add('process-video', {
      filePath: filePath,
      videoName,
      outputDir: outputDir,
      resolutions: resolutions
    });

    console.log(`[QUEUE] Job ${job.id} added to queue`);

    // Wait for job to complete
    const result = await job.finished();
    const s3FolderPath = `hls-videos/${videoName}`;
    const s3Result = await uploadToS3(outputDir, s3FolderPath);
    console.log('[COMPLETE] Job finished', s3Result);
    console.log('[CLEANUP] Removing local HLS files...');
    cleanupLocalFiles(outputDir);

    res.status(200).json({
      message: 'Video processing completed successfully',
      masterPlaylist: s3Result.masterPlaylistUrl,
      processedFileName: videoName
    });

  } catch (error) {
    console.error('[ERROR] Processing failed:', error);
    res.status(500).json({
      error: 'Error during video processing',
      details: error.message
    });
  }
});

module.exports = app;
