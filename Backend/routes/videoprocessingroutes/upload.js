const express = require('express');
const path = require('path');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');

const app = express.Router();
let videoName;

/**
 * Sanitize filename by:
 * - Removing special characters
 * - Converting to lowercase
 * - Replacing spaces with hyphens
 */
const sanitizeFileName = (fileName) => {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '')  // Remove special characters
    .replace(/-+/g, '-')         // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');    // Remove leading/trailing hyphens
};

// Storage engine configuration
const storageEngine = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, callback) {
    // Sanitize filename before saving
    const sanitizedName = sanitizeFileName(file.originalname);
    console.log('Original filename:', file.originalname);
    console.log('Sanitized filename:', sanitizedName);
    callback(null, sanitizedName);
  },
});

// File filter for video validation
const fileFilter = (req, file, callback) => {
  const validTypes = /mp4|MOV|m4v/;
  const isValid = validTypes.test(path.extname(file.originalname));
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

// Initialize multer
const upload = multer({
  storage: storageEngine,
  fileFilter: fileFilter,
});

// Video upload and HLS generation route
app.post('/', upload.single('uploadedFile'), (req, res) => {
  try {
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    console.log('Uploaded file path:', filePath);

    // Sanitize video name for folder creation
    videoName = sanitizeFileName(path.parse(req.file.originalname).name);
    console.log('Processed video name:', videoName);

    const outputDir = `./public/hls/${videoName}`;
    const resolutions = ['240p', '360p', '720p'];

    // Create directories
    fs.mkdirSync(outputDir, { recursive: true });
    resolutions.forEach(res => {
      const resPath = `${outputDir}/${res}`;
      fs.mkdirSync(resPath, { recursive: true });
      console.log(`Created resolution directory: ${resPath}`);
    });

  // Generate subdirectories for each resolution
  resolutions.forEach(res => fs.mkdirSync(`${outputDir}/${res}`, { recursive: true }));

  // FFmpeg command to generate HLS for each resolution
//   This command takes an input video, scales it down to 426x240 resolution, encodes it using H.264 for video and AAC for audio, and outputs it as an HLS (HTTP Live Streaming) playlist with segments. The settings ensure a balance between quality and file size, suitable for streaming.
  const ffmpegCommand = `
ffmpeg -i ${filePath} -vf scale=426x240 -c:a aac -ar 48000 -c:v h264 -profile:v baseline -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 400k -maxrate 400k -bufsize 800k -b:a 128k -hls_segment_filename '${outputDir}/240p/stream_240p_%03d.ts' ${outputDir}/240p/stream_240p.m3u8
ffmpeg -i ${filePath} -vf scale=640x360 -c:a aac -ar 48000 -c:v h264 -profile:v baseline -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 800k -maxrate 800k -bufsize 1600k -b:a 128k -hls_segment_filename '${outputDir}/360p/stream_360p_%03d.ts' ${outputDir}/360p/stream_360p.m3u8
ffmpeg -i ${filePath} -vf scale=1280x720 -c:a aac -ar 48000 -c:v h264 -profile:v baseline -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 2800k -maxrate 2800k -bufsize 5600k -b:a 128k -hls_segment_filename '${outputDir}/720p/stream_720p_%03d.ts' ${outputDir}/720p/stream_720p.m3u8
cat <<EOF > ${outputDir}/master.m3u8
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=426x240
240p/stream_240p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p/stream_360p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p/stream_720p.m3u8
EOF
`;

// This command is using a 'here document' (<<EOF) to create or overwrite a file. The `cat <<EOF` tells the shell to take all lines between '<<EOF' and 'EOF' and write them to a file.

exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('FFmpeg error:', error);
      console.error('FFmpeg stderr:', stderr);
      return res.status(500).json({
        error: 'Error processing video',
        details: stderr
      });
    }

    console.log('HLS generation completed successfully');

    // Delete original file
    fs.unlinkSync(filePath);
    console.log('Deleted original file:', filePath);

    res.status(200).json({
      message: 'HLS generated successfully',
      masterPlaylist: `${process.env.HOST}/api/hls/${videoName}/master.m3u8`,
      processedFileName: videoName
    });
  });

} catch (error) {
  console.error('Upload processing error:', error);
  res.status(500).json({
    error: 'Server error while processing upload',
    message: error.message
  });
}
});

module.exports = app;
