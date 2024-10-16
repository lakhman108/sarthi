const express = require('express');
const path = require('path');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');

const app = express.Router();
let videoName;
// Storage engine for multer
//we need to give the destination where the file will be stored
const storageEngine = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, callback) {
    callback(
      null,
      file.originalname // Using original file name for folder creation
    );
  },
});

//  File filter for video files
//  in this file filter we are checking the file extension and if it is not mp4, MOV, m4v
// then we are throwing an error
const fileFilter = (req, file, callback) => {
  let pattern = /mp4|MOV|m4v/; // regex for video files
  if (pattern.test(path.extname(file.originalname))) {
    //in callback we are checking if the file is video file or not
    callback(null, true);
  } else {
    callback('Error: not a valid file');
  }
};

// Initialize multer and providing storage engine and file filter
const upload = multer({
  storage: storageEngine,
  fileFilter: fileFilter,
});

// Routing for video upload and HLS generation
app.post('/', upload.single('uploadedFile'), (req, res) => {
    console.log(req.file);
  const filePath = req.file.path;
  console.log(filePath);
  // Get video name without extension like without .mp4 ...
 videoName = path.parse(req.file.originalname).name;
 //making the output directory path
  const outputDir = `./public/hls/${videoName}`;
  // Resolutions for HLS
  const resolutions = ['240p', '360p', '720p'];

  // Creating main directory for the video
  //recursive is true so that it will create the directory if it is not present
  fs.mkdirSync(outputDir, { recursive: true });

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
      console.error(`Error generating HLS: ${stderr}`);
      return res.status(500).send('Error processing video');
    }

    // Delete original video after HLS is created
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'HLS generated successfully',
      masterPlaylist: `http://localhost:3000/api/hls/${videoName}/master.m3u8`,
    });
  });
});



module.exports = app;
