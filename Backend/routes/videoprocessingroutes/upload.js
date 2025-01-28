const express = require('express');
const path = require('path');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs');
const axios = require('axios');

const app = express.Router();

// Helper functions
const sanitizeFileName = (fileName) => {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const uploadToBunny = async (filePath, remotePath) => {
  try {
    const fileContent = fs.readFileSync(filePath);
    const contentType = path.extname(filePath) === '.m3u8'
      ? 'application/x-mpegURL'
      : path.extname(filePath) === '.ts'
        ? 'video/MP2T'
        : 'application/octet-stream';

    await axios.put(
      `https://${process.env.BUNNY_STORAGE_ENDPOINT}/${process.env.BUNNY_STORAGE_ZONE}/${remotePath}`,
      fileContent,
      {
        headers: {
          'AccessKey': process.env.BUNNY_API_KEY,
          'Content-Type': contentType,
          'Accept': '*/*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS'
        }
      }
    );
    return `https://${process.env.BUNNY_CDN_HOST}/${remotePath}`;
  } catch (error) {
    console.error('Bunny upload error:', error);
    throw error;
  }
};
const generateHLS = async (inputPath, outputDir, resolution) => {
  return new Promise((resolve, reject) => {
    const [width, height] = resolution.split('x');
    const quality = height + 'p';
    const bitrate = {
      '240p': '400k',
      '360p': '800k',
      '720p': '2800k'
    }[quality];

    const args = [
      '-i', inputPath,
      '-vf', `scale=${width}:${height}`,
      '-c:a', 'aac',
      '-ar', '48000',
      '-c:v', 'h264',
      '-profile:v', 'baseline',
      '-crf', '20',
      '-sc_threshold', '0',
      '-g', '48',
      '-keyint_min', '48',
      '-hls_time', '4',
      '-hls_playlist_type', 'vod',
      '-b:v', bitrate,
      '-maxrate', bitrate,
      '-bufsize', parseInt(bitrate) * 2 + 'k',
      '-b:a', '128k',
      '-hls_segment_filename',
      `${outputDir}/${quality}/stream_${quality}_%03d.ts`,
      `${outputDir}/${quality}/stream_${quality}.m3u8`
    ];

    const ffmpeg = spawn('ffmpeg', args);
    let progress = '';

    ffmpeg.stderr.on('data', (data) => {
      progress += data.toString();
      if (progress.includes('frame=')) {
        console.log(`Processing ${quality}: ${progress.split('frame=').pop().split('fps=')[0].trim()} frames`);
      }
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
};

// Multer configuration
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    const sanitizedName = sanitizeFileName(file.originalname);
    cb(null, sanitizedName);
  }
});

const fileFilter = (req, file, cb) => {
  const validTypes = /mp4|MOV|m4v/;
  const isValid = validTypes.test(path.extname(file.originalname));
  if (isValid) cb(null, true);
  else cb(new Error('Invalid file type. Only MP4, MOV, M4V allowed'));
};

const upload = multer({ storage, fileFilter });

// Upload route
app.post('/', upload.single('uploadedFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const videoName = sanitizeFileName(path.parse(req.file.originalname).name);
    const outputDir = `./public/hls/${videoName}`;
    const resolutions = ['426x240', '640x360', '1280x720'];

    // Create directories
    fs.mkdirSync(outputDir, { recursive: true });
    ['240p', '360p', '720p'].forEach(res => {
      fs.mkdirSync(`${outputDir}/${res}`, { recursive: true });
    });

    // Generate HLS
    console.log('Starting HLS generation...');
    await Promise.all(resolutions.map(res => generateHLS(filePath, outputDir, res)));

    // Upload to Bunny.net
    console.log('Uploading to Bunny.net...');
    const uploadPromises = [];
    ['240p', '360p', '720p'].forEach(quality => {
      const files = fs.readdirSync(`${outputDir}/${quality}`);
      files.forEach(file => {
        const localPath = `${outputDir}/${quality}/${file}`;
        const remotePath = `${videoName}/${quality}/${file}`;
        uploadPromises.push(uploadToBunny(localPath, remotePath));
      });
    });

    await Promise.all(uploadPromises);

    // Generate and upload master playlist
    const masterContent = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=426x240
240p/stream_240p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p/stream_360p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p/stream_720p.m3u8`;

    const masterPlaylistPath = `${outputDir}/master.m3u8`;
    fs.writeFileSync(masterPlaylistPath, masterContent);
    await uploadToBunny(masterPlaylistPath, `${videoName}/master.m3u8`);

    // Cleanup
    fs.rmSync(outputDir, { recursive: true });
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'Video processed and uploaded successfully',
      masterPlaylist: `https://${process.env.BUNNY_CDN_HOST}/${videoName}/master.m3u8`,
      processedFileName: videoName
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({
      error: 'Error processing video',
      message: error.message
    });
  }
});

module.exports = app;
