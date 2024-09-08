const express = require('express');
const path = require('path');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');

const app = express.Router();

// Storage engine for multer
const storageEngine = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, callback) {
    callback(
      null,
      file.originalname // Use original file name for folder creation
    );
  },
});

// File filter for video files
const fileFilter = (req, file, callback) => {
  let pattern = /mp4|mov|m4v/; // regex for video files
  if (pattern.test(path.extname(file.originalname))) {
    callback(null, true);
  } else {
    callback('Error: not a valid file');
  }
};

// Initialize multer
const upload = multer({
  storage: storageEngine,
  fileFilter: fileFilter,
});

// Routing for video upload and HLS generation
app.post('/', upload.single('uploadedFile'), (req, res) => {
  const filePath = req.file.path;
  const videoName = path.parse(req.file.originalname).name; // Get video name without extension
  const outputDir = `./public/hls/${videoName}`;
  const resolutions = ['240p', '360p', '720p'];

  // Create main directory for the video
  fs.mkdirSync(outputDir, { recursive: true });

  // Generate subdirectories for each resolution
  resolutions.forEach(res => fs.mkdirSync(`${outputDir}/${res}`, { recursive: true }));

  // FFmpeg command to generate HLS for each resolution
  const ffmpegCommand = `
    ffmpeg -i ${filePath} -vf scale=426x240 -c:a aac -ar 48000 -c:v h264 -profile:v baseline -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 400k -maxrate 400k -bufsize 800k -b:a 128k -hls_segment_filename '${outputDir}/240p/stream_240p_%03d.ts' ${outputDir}/240p/stream_240p.m3u8 &&
    ffmpeg -i ${filePath} -vf scale=640x360 -c:a aac -ar 48000 -c:v h264 -profile:v baseline -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 800k -maxrate 800k -bufsize 1600k -b:a 128k -hls_segment_filename '${outputDir}/360p/stream_360p_%03d.ts' ${outputDir}/360p/stream_360p.m3u8 &&
    ffmpeg -i ${filePath} -vf scale=1280x720 -c:a aac -ar 48000 -c:v h264 -profile:v baseline -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 2800k -maxrate 2800k -bufsize 5600k -b:a 128k -hls_segment_filename '${outputDir}/720p/stream_720p_%03d.ts' ${outputDir}/720p/stream_720p.m3u8 &&
    echo "#EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=426x240
    240p/stream_240p.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
    360p/stream_360p.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
    720p/stream_720p.m3u8" > ${outputDir}/master.m3u8`;

  // Execute FFmpeg command
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating HLS: ${stderr}`);
      return res.status(500).send('Error processing video');
    }

    // Delete original video after HLS is created
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'HLS generated successfully',
      masterPlaylist: `${outputDir}/master.m3u8`,
    });
  });
});

module.exports = app;
