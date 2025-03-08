const express = require('express');
const path = require('path');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');

const app = express.Router();

let videoName;

const sanitizeFileName = (fileName) => {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const storageEngine = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, callback) {
    const sanitizedName = sanitizeFileName(file.originalname);
    console.log('Original filename:', file.originalname);
    console.log('Sanitized filename:', sanitizedName);
    callback(null, sanitizedName);
  },
});

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

const upload = multer({
  storage: storageEngine,
  fileFilter: fileFilter,
});

// Helper function to create directories
const createDirectories = (outputDir, resolutions) => {
  fs.mkdirSync(outputDir, { recursive: true });
  resolutions.forEach(res => {
    const resPath = `${outputDir}/${res}`;
    fs.mkdirSync(resPath, { recursive: true });
    console.log(`Created resolution directory: ${resPath}`);
  });
};

// Helper function to generate master playlist
const generateMasterPlaylist = (outputDir, resolutions) => {
  const playlistContent = `#EXTM3U
${resolutions.map(res => {
  const [width, height] = res === '240p' ? [426, 240] :
                         res === '360p' ? [640, 360] :
                         [1280, 720];
  const bandwidth = res === '240p' ? 400000 :
                   res === '360p' ? 800000 :
                   2800000;
  return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${width}x${height}
${res}/stream_${res}.m3u8`;
}).join('\n')}`;

  fs.writeFileSync(`${outputDir}/master.m3u8`, playlistContent);
};

app.post('/', upload.single('uploadedFile'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    console.log('Uploaded file path:', filePath);

    videoName = sanitizeFileName(path.parse(req.file.originalname).name);
    console.log('Processed video name:', videoName);

    const outputDir = `./public/hls/${videoName}`;
    const resolutions = ['240p', '360p', '720p'];
    const progressiveDir = `${outputDir}/progressive`;

    // Create directories
    createDirectories(outputDir, resolutions);
    fs.mkdirSync(progressiveDir, { recursive: true });

    // Step 1: Generate high-quality progressive MP4s for each resolution
    const generateProgressiveVersions = new Promise((resolve, reject) => {
      const progressiveCommand = `
        ffmpeg -i ${filePath} \
        -vf "scale=426:240" -c:v h264 -profile:v baseline -preset fast -crf 23 ${progressiveDir}/240p.mp4 \
        -vf "scale=640:360" -c:v h264 -profile:v baseline -preset fast -crf 23 ${progressiveDir}/360p.mp4 \
        -vf "scale=1280:720" -c:v h264 -profile:v baseline -preset fast -crf 23 ${progressiveDir}/720p.mp4
      `;

      exec(progressiveCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('Progressive encoding error:', error);
          reject(error);
        } else {
          console.log('Progressive versions generated successfully');
          resolve();
        }
      });
    });

    // Step 2: Repackage progressive versions into HLS
    const repackageToHLS = async () => {
      for (const res of resolutions) {
        const inputFile = `${progressiveDir}/${res}.mp4`;
        const outputPath = `${outputDir}/${res}`;

        // Using MP4Box for fast repackaging (similar to Instagram's approach)
        const repackageCommand = `
          MP4Box -dash 2000 -profile dashavc264:onDemand \
          -segment-name segment_%s.m4s \
          -out ${outputPath}/stream_${res}.mpd ${inputFile}
        `;

        await new Promise((resolve, reject) => {
          exec(repackageCommand, (error, stdout, stderr) => {
            if (error) {
              console.error(`Repackaging error for ${res}:`, error);
              reject(error);
            } else {
              console.log(`Repackaged ${res} successfully`);
              resolve();
            }
          });
        });
      }
    };

    try {
      // Execute the steps
      await generateProgressiveVersions;
      await repackageToHLS();
      generateMasterPlaylist(outputDir, resolutions);

      // Clean up
      fs.unlinkSync(filePath);
      fs.rmSync(progressiveDir, { recursive: true });

      res.status(200).json({
        message: 'Video processing completed successfully',
        masterPlaylist: `${process.env.HOST}/api/hls/${videoName}/master.m3u8`,
        processedFileName: videoName
      });
    } catch (error) {
      console.error('Processing error:', error);
      res.status(500).json({
        error: 'Error during video processing',
        details: error.message
      });
    }

  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({
      error: 'Server error while processing upload',
      message: error.message
    });
  }
});

module.exports = app;
