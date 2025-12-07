# Async Video Processing System - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [How It Works](#how-it-works)
4. [Bull Queue Explained](#bull-queue-explained)
5. [Sequence Diagrams](#sequence-diagrams)
6. [Components Deep Dive](#components-deep-dive)
7. [Troubleshooting](#troubleshooting)
8. [Making It More Reliable](#making-it-more-reliable)

---

## Overview

### What Problem Does This Solve?

**Before (Synchronous Processing):**
- User uploads video → Server processes video → User waits 5+ minutes → Response
- Server blocks during processing
- User can't do anything else
- If processing fails, user loses everything

**After (Asynchronous Processing):**
- User uploads video → Server responds immediately → Processing happens in background
- User can continue using the app
- Real-time status updates
- Better error handling

### Key Technologies

1. **Bull Queue** - Job queue system for background processing
2. **Redis** - In-memory database that stores the queue
3. **FFmpeg** - Video transcoding tool
4. **MinIO/S3** - Cloud storage for processed videos
5. **MongoDB** - Database for lecture metadata

---

## System Architecture

```mermaid
graph TB
    subgraph "Frontend"
        A[User Browser]
    end
    
    subgraph "Backend Server"
        B[Express API]
        C[Upload Endpoint]
        D[Bull Queue]
        E[Worker Process]
    end
    
    subgraph "External Services"
        F[Redis Server]
        G[MongoDB]
        H[MinIO/S3]
    end
    
    subgraph "File System"
        I[Uploaded Videos]
        J[Processed HLS Files]
    end
    
    A -->|1. Upload Video| B
    B --> C
    C -->|2. Save File| I
    C -->|3. Create Lecture Record| G
    C -->|4. Add Job to Queue| D
    D <-->|Store Jobs| F
    C -->|5. Return Response| A
    
    D -->|6. Pick Job| E
    E -->|7. Read Video| I
    E -->|8. Process with FFmpeg| J
    E -->|9. Upload to Cloud| H
    E -->|10. Update Status| G
    E -->|11. Cleanup| I
    E -->|11. Cleanup| J
```

---

## How It Works

### Step-by-Step Flow

#### 1. User Uploads Video

```javascript
// Frontend sends video file
const formData = new FormData();
formData.append('uploadedFile', videoFile);
formData.append('courseId', courseId);
formData.append('nameOfTopic', topicName);

await axios.post('/api/upload', formData);
```

#### 2. Server Receives Upload

```javascript
// Backend: upload.js
app.post('/', upload.single('uploadedFile'), async (req, res) => {
  // File is saved to: public/uploads/filename.mp4
  const filePath = path.resolve(req.file.path);
  
  // Create lecture record in database
  const lecture = new Lecture({
    courseId,
    nameOfTopic,
    processingStatus: 'pending',
    jobId: jobId
  });
  await lecture.save();
  
  // Add job to queue (doesn't process yet!)
  await videoProcessingQueue.add('process-video', {
    filePath,
    videoName,
    outputDir,
    resolutions: ['240p', '360p', '720p'],
    lectureId: lecture._id
  });
  
  // Return immediately - user doesn't wait!
  res.status(202).json({
    message: 'Video upload accepted',
    lectureId: lecture._id,
    processingStatus: 'pending'
  });
});
```

#### 3. Worker Picks Up Job

```javascript
// Worker process (runs in background)
videoProcessingQueue.process('process-video', 1, async (job) => {
  const { filePath, videoName, lectureId } = job.data;
  
  // Update status to "processing"
  await Lecture.findByIdAndUpdate(lectureId, {
    processingStatus: 'processing'
  });
  
  // Process video (takes 2-5 minutes)
  const result = await processVideo(filePath, videoName, outputDir, resolutions);
  
  // Upload to MinIO
  await uploadToMinIO(outputDir, s3FolderPath);
  
  // Update status to "completed"
  await Lecture.findByIdAndUpdate(lectureId, {
    processingStatus: 'completed',
    videoLink: minioResult.masterPlaylistUrl
  });
});
```

---

## Bull Queue Explained

### What is Bull Queue?

Think of Bull Queue like a **to-do list for your server**:

1. **Queue** = A list of tasks waiting to be done
2. **Job** = A single task (like "process this video")
3. **Worker** = The person doing the tasks
4. **Redis** = The notebook where the to-do list is written

### Why Use Bull Queue?

**Without Queue:**
```
User 1 uploads → Server processes (5 min) → Done
User 2 uploads → Waits for User 1 → Server processes (5 min) → Done
User 3 uploads → Waits for User 1 & 2 → Server processes (5 min) → Done
```
Total time: 15 minutes for 3 users!

**With Queue:**
```
User 1 uploads → Added to queue → Response (instant)
User 2 uploads → Added to queue → Response (instant)
User 3 uploads → Added to queue → Response (instant)

Worker processes them one by one in background
```
All users get instant response!

### Bull Queue Components

```mermaid
graph LR
    A[Your Code] -->|Add Job| B[Bull Queue]
    B -->|Store| C[Redis]
    C -->|Retrieve| D[Worker]
    D -->|Process| E[Your Processing Function]
    E -->|Update| F[Database]
```

#### 1. Creating a Queue

```javascript
const Queue = require('bull');

// Create a queue named "video processing"
// Redis URL tells it where to store the jobs
const videoProcessingQueue = new Queue(
  'video processing',  // Queue name
  process.env.REDIS_URL // Redis connection
);
```

#### 2. Adding Jobs to Queue

```javascript
// Add a job to the queue
const job = await videoProcessingQueue.add(
  'process-video',  // Job type
  {                 // Job data
    filePath: '/path/to/video.mp4',
    videoName: 'my-video',
    lectureId: '12345'
  }
);

console.log(`Job ${job.id} added to queue`);
// Job is now waiting in Redis
```

#### 3. Worker Processing Jobs

```javascript
// Worker listens for jobs
videoProcessingQueue.process(
  'process-video',  // Job type to process
  1,                // Number of concurrent jobs (1 = one at a time)
  async (job) => {  // Processing function
    console.log(`Processing job ${job.id}`);
    
    // Access job data
    const { filePath, videoName } = job.data;
    
    // Do the work
    await processVideo(filePath, videoName);
    
    // Job automatically marked as completed
    return { success: true };
  }
);
```

### Queue States

```mermaid
stateDiagram-v2
    [*] --> Waiting: Job Added
    Waiting --> Active: Worker Picks Up
    Active --> Completed: Success
    Active --> Failed: Error
    Failed --> Waiting: Retry
    Completed --> [*]
    Failed --> [*]: Max Retries
```

**Job States:**
- **Waiting** - Job is in queue, waiting for worker
- **Active** - Worker is currently processing
- **Completed** - Job finished successfully
- **Failed** - Job encountered an error
- **Delayed** - Job scheduled for future

---

## Sequence Diagrams

### Complete Video Upload Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant API as Express API
    participant FS as File System
    participant DB as MongoDB
    participant Q as Bull Queue
    participant R as Redis
    participant W as Worker Process
    participant FF as FFmpeg
    participant S3 as MinIO/S3

    U->>API: POST /api/upload (video file)
    API->>FS: Save video to uploads/
    FS-->>API: File saved
    
    API->>DB: Create Lecture (status: pending)
    DB-->>API: Lecture created (ID: 123)
    
    API->>Q: Add job to queue
    Q->>R: Store job data
    R-->>Q: Job stored
    Q-->>API: Job ID: 456
    
    API-->>U: 202 Response (lectureId: 123, status: pending)
    
    Note over U: User can continue using app
    
    R->>W: Job available
    W->>Q: Pick up job 456
    
    W->>DB: Update status to "processing"
    DB-->>W: Updated
    
    W->>FS: Read video file
    FS-->>W: Video data
    
    W->>FF: Transcode to 240p
    FF-->>W: 240p segments
    
    W->>FF: Transcode to 360p
    FF-->>W: 360p segments
    
    W->>FF: Transcode to 720p
    FF-->>W: 720p segments
    
    W->>W: Generate master playlist
    
    W->>S3: Upload all HLS files
    S3-->>W: Upload complete (URL)
    
    W->>DB: Update status to "completed" + videoLink
    DB-->>W: Updated
    
    W->>FS: Delete local files
    FS-->>W: Deleted
    
    W->>Q: Mark job as completed
    Q->>R: Update job status
    
    Note over U: Frontend polls and sees "completed"
    U->>API: GET /api/lectures/123
    API->>DB: Fetch lecture
    DB-->>API: Lecture data (status: completed)
    API-->>U: Lecture with video URL
```

### Error Handling Flow

```mermaid
sequenceDiagram
    participant W as Worker
    participant FF as FFmpeg
    participant DB as MongoDB
    participant Q as Bull Queue

    W->>FF: Process video
    FF-->>W: Error (code 254)
    
    W->>DB: Update status to "failed"
    W->>DB: Save error message
    DB-->>W: Updated
    
    W->>Q: Mark job as failed
    Q-->>W: Job failed
    
    Note over Q: Job can be retried or removed
```

### Concurrent Processing (Why We Use 1 Worker)

```mermaid
sequenceDiagram
    participant Q as Queue
    participant W1 as Worker 1
    participant W2 as Worker 2
    participant CPU as CPU/Memory

    Note over Q: With 2 concurrent workers (OLD - BROKEN)
    
    Q->>W1: Job 1 (Video A)
    Q->>W2: Job 2 (Video B)
    
    W1->>CPU: FFmpeg process (heavy)
    W2->>CPU: FFmpeg process (heavy)
    
    Note over CPU: CPU overloaded!<br/>Both processes slow down<br/>One or both fail
    
    CPU-->>W1: Error (timeout)
    CPU-->>W2: Success
    
    Note over Q: With 1 concurrent worker (NEW - WORKING)
    
    Q->>W1: Job 1 (Video A)
    W1->>CPU: FFmpeg process
    Note over W2: Waiting...
    CPU-->>W1: Success
    
    Q->>W1: Job 2 (Video B)
    W1->>CPU: FFmpeg process
    CPU-->>W1: Success
```

---

## Components Deep Dive

### 1. Redis - The Queue Storage

**What is Redis?**
- In-memory database (super fast)
- Stores queue jobs temporarily
- Like RAM for your queue

**Why Redis?**
- Fast: Stores data in memory, not disk
- Persistent: Can save to disk if server restarts
- Reliable: Industry standard for queues

**Connection:**
```javascript
const Queue = require('bull');

// Redis URL format: redis://username:password@host:port/database
const videoProcessingQueue = new Queue(
  'video processing',
  'redis://default:password@20.193.139.48:6379/0'
);
```

**What's Stored in Redis:**
```json
{
  "jobId": "456",
  "type": "process-video",
  "data": {
    "filePath": "/path/to/video.mp4",
    "videoName": "my-video",
    "lectureId": "123"
  },
  "status": "waiting",
  "attempts": 0,
  "timestamp": "2024-12-07T10:00:00Z"
}
```

### 2. MongoDB - Lecture Metadata

**Lecture Schema:**
```javascript
{
  _id: ObjectId("123"),
  courseId: ObjectId("456"),
  nameOfTopic: "Introduction to React",
  videoLink: "https://minio.com/videos/react-intro/master.m3u8",
  processingStatus: "completed",  // pending, processing, completed, failed
  jobId: "789",
  processingError: null,
  noOfViews: 0,
  noOfLikes: 0,
  comments: []
}
```

**Status Flow:**
```
pending → processing → completed
                    ↓
                  failed
```

### 3. FFmpeg - Video Transcoding

**What is FFmpeg?**
- Command-line tool for video processing
- Converts videos to different formats/resolutions
- Creates HLS (HTTP Live Streaming) files

**What We Do:**
1. Take original video (e.g., 1080p MP4)
2. Convert to 3 resolutions: 240p, 360p, 720p
3. Split each into 6-second segments
4. Create playlist files (.m3u8)

**FFmpeg Command Example:**
```bash
ffmpeg -i input.mp4 \
  -vf scale=426:240 \           # Resize to 240p
  -c:v h264 \                   # Video codec
  -b:v 800k \                   # Bitrate
  -c:a aac \                    # Audio codec
  -hls_time 6 \                 # 6 second segments
  -hls_list_size 0 \            # Include all segments
  -hls_segment_filename "segment_%03d.ts" \
  -f hls \                      # HLS format
  "stream_240p.m3u8"            # Output playlist
```

**Output Structure:**
```
hls/
  my-video/
    240p/
      stream_240p.m3u8      # Playlist
      segment_000.ts        # Video segment 1
      segment_001.ts        # Video segment 2
      segment_002.ts        # Video segment 3
    360p/
      stream_360p.m3u8
      segment_000.ts
      segment_001.ts
    720p/
      stream_720p.m3u8
      segment_000.ts
      segment_001.ts
    master.m3u8             # Main playlist (points to all resolutions)
```

**Master Playlist (master.m3u8):**
```m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=928000,RESOLUTION=426x240
240p/stream_240p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1528000,RESOLUTION=640x360
360p/stream_360p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3328000,RESOLUTION=1280x720
720p/stream_720p.m3u8
```

### 4. MinIO/S3 - Cloud Storage

**What is MinIO?**
- S3-compatible object storage
- Stores processed video files
- Serves videos to users

**Upload Process:**
```javascript
// Upload all HLS files to MinIO
const files = getAllFiles('./hls/my-video/');

for (const file of files) {
  await s3.upload({
    Bucket: 'sarthistorage',
    Key: 'hls-videos/my-video/240p/segment_000.ts',
    Body: fileContent,
    ContentType: 'video/mp2t'
  });
}
```

**Final URL:**
```
https://api-s3.sarthivideo.tech/sarthistorage/hls-videos/my-video/master.m3u8
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Videos Stuck in "Pending" Status

**Symptoms:**
- Lecture created but never processes
- No worker logs in console

**Causes:**
- Worker not running
- Redis connection failed
- Job not added to queue

**Solution:**
```bash
# Check queue status
node Backend/migrations/checkQueueStatus.js

# Check if jobs are waiting
# If waiting > 0 but no worker logs, restart server

# Clean stuck lectures
node Backend/migrations/deleteStuckPendingLectures.js
```

#### 2. FFmpeg Errors (Code 254, 183)

**Symptoms:**
- Job fails immediately
- Error: "FFmpeg process exited with code 254"

**Causes:**
- Video file not found (wrong path)
- Corrupted video file
- Unsupported video codec

**Solution:**
```javascript
// We added file validation
if (!fs.existsSync(filePath)) {
  throw new Error('Video file not found');
}

// Check file size
const stats = fs.statSync(filePath);
if (stats.size === 0) {
  throw new Error('Video file is empty');
}
```

#### 3. Every Other Video Fails

**Symptoms:**
- Video 1: Success
- Video 2: Fails
- Video 3: Success
- Video 4: Fails

**Cause:**
- Multiple concurrent workers (resource contention)

**Solution:**
```javascript
// Changed from 2 to 1 concurrent worker
videoProcessingQueue.process('process-video', 1, async (job) => {
  // Only 1 video processes at a time
});
```

#### 4. MinIO Upload Timeouts

**Symptoms:**
- Video processes successfully
- Upload fails with timeout errors
- Status stuck in "processing"

**Causes:**
- Slow network connection
- MinIO server overloaded
- Too many files uploading at once

**Solution:**
- Add retry logic (see "Making It More Reliable")
- Increase timeout settings
- Upload files in batches

### Diagnostic Commands

```bash
# Check queue status
node Backend/migrations/checkQueueStatus.js

# Check lecture processing status
node Backend/migrations/checkProcessingStatus.js

# Delete failed lectures
node Backend/migrations/deleteFailedLectures.js

# Delete stuck pending lectures
node Backend/migrations/deleteStuckPendingLectures.js

# Clean failed queue jobs
node Backend/migrations/cleanFailedQueue.js

# Full cleanup (database + queue)
node Backend/migrations/fullCleanup.js

# Test system health
node Backend/migrations/testVideoProcessing.js
```

---

## Making It More Reliable

### 1. Add Job Retry Logic

**Problem:** If a job fails, it's lost forever

**Solution:** Automatically retry failed jobs

```javascript
// Add job with retry configuration
await videoProcessingQueue.add('process-video', jobData, {
  attempts: 3,              // Retry up to 3 times
  backoff: {
    type: 'exponential',    // Wait longer between each retry
    delay: 5000             // Start with 5 second delay
  },
  removeOnComplete: true,   // Clean up after success
  removeOnFail: false       // Keep failed jobs for debugging
});
```

**Retry Schedule:**
- Attempt 1: Immediate
- Attempt 2: Wait 5 seconds
- Attempt 3: Wait 25 seconds (5 * 5)
- Attempt 4: Wait 125 seconds (25 * 5)

### 2. Add Job Timeout

**Problem:** Jobs can run forever if something hangs

**Solution:** Set maximum processing time

```javascript
videoProcessingQueue.process('process-video', 1, async (job) => {
  // Set 30 minute timeout
  job.timeout = 1800000; // 30 minutes in milliseconds
  
  try {
    await processVideo(job.data);
  } catch (error) {
    if (error.message.includes('timeout')) {
      console.error('Job timed out after 30 minutes');
    }
    throw error;
  }
});
```

### 3. Add Progress Tracking

**Problem:** User doesn't know what's happening

**Solution:** Update job progress

```javascript
videoProcessingQueue.process('process-video', 1, async (job) => {
  // Update progress: 0-100%
  await job.progress(0);  // Starting
  
  await processResolution('240p');
  await job.progress(33); // 33% done
  
  await processResolution('360p');
  await job.progress(66); // 66% done
  
  await processResolution('720p');
  await job.progress(100); // Complete
});
```

**Frontend can check progress:**
```javascript
const job = await videoProcessingQueue.getJob(jobId);
console.log(`Progress: ${job.progress()}%`);
```

### 4. Add MinIO Upload Retry

**Problem:** MinIO uploads timeout frequently

**Solution:** Retry failed uploads

```javascript
const uploadToMinIO = async (localFolderPath, s3FolderPath, maxRetries = 3) => {
  const allFiles = getAllFiles(localFolderPath);
  
  for (const filePath of allFiles) {
    let uploaded = false;
    let attempts = 0;
    
    while (!uploaded && attempts < maxRetries) {
      try {
        await s3.upload(uploadParams).promise();
        uploaded = true;
        console.log(`✓ Uploaded: ${s3Key}`);
      } catch (error) {
        attempts++;
        console.error(`✗ Upload failed (attempt ${attempts}/${maxRetries}): ${s3Key}`);
        
        if (attempts < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        } else {
          throw error; // Give up after max retries
        }
      }
    }
  }
};
```

### 5. Add Queue Event Listeners

**Problem:** Hard to debug what's happening

**Solution:** Log all queue events

```javascript
// Listen to queue events
videoProcessingQueue.on('completed', (job, result) => {
  console.log(`✓ Job ${job.id} completed successfully`);
  console.log(`  Lecture: ${job.data.lectureId}`);
  console.log(`  Video: ${result.masterPlaylistUrl}`);
});

videoProcessingQueue.on('failed', (job, error) => {
  console.error(`✗ Job ${job.id} failed`);
  console.error(`  Lecture: ${job.data.lectureId}`);
  console.error(`  Error: ${error.message}`);
});

videoProcessingQueue.on('stalled', (job) => {
  console.warn(`⚠ Job ${job.id} stalled (worker crashed?)`);
});

videoProcessingQueue.on('progress', (job, progress) => {
  console.log(`⟳ Job ${job.id} progress: ${progress}%`);
});
```

### 6. Add Health Check Endpoint

**Problem:** Don't know if system is working

**Solution:** Create health check API

```javascript
app.get('/api/health/queue', async (req, res) => {
  try {
    const waiting = await videoProcessingQueue.getWaitingCount();
    const active = await videoProcessingQueue.getActiveCount();
    const failed = await videoProcessingQueue.getFailedCount();
    
    const isHealthy = failed < 10 && waiting < 50;
    
    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      queue: {
        waiting,
        active,
        failed
      },
      worker: {
        concurrency: 1,
        status: active > 0 ? 'processing' : 'idle'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});
```

### 7. Add Monitoring Dashboard

**Problem:** Can't see queue status easily

**Solution:** Use Bull Board (web UI for Bull queues)

```bash
npm install @bull-board/express @bull-board/api
```

```javascript
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullAdapter(videoProcessingQueue)],
  serverAdapter: serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());
```

**Access dashboard at:** `http://localhost:3000/admin/queues`

---

### 8. Add Database Cleanup Job

**Problem:** Old completed jobs fill up Redis

**Solution:** Periodic cleanup

```javascript
// Clean up old jobs every hour
setInterval(async () => {
  // Remove completed jobs older than 24 hours
  await videoProcessingQueue.clean(24 * 60 * 60 * 1000, 'completed');
  
  // Remove failed jobs older than 7 days
  await videoProcessingQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed');
  
  console.log('Queue cleanup completed');
}, 60 * 60 * 1000); // Every hour
```

### 9. Add Graceful Shutdown

**Problem:** Server restart kills active jobs

**Solution:** Wait for jobs to finish before shutdown

```javascript
// Handle shutdown signals
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing queue...');
  
  // Stop accepting new jobs
  await videoProcessingQueue.pause();
  
  // Wait for active jobs to complete (max 5 minutes)
  await videoProcessingQueue.close(5 * 60 * 1000);
  
  console.log('Queue closed, exiting...');
  process.exit(0);
});
```

### 10. Add Rate Limiting

**Problem:** Too many uploads overwhelm system

**Solution:** Limit upload rate

```javascript
const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 uploads per 15 minutes per IP
  message: 'Too many uploads, please try again later'
});

app.post('/api/upload', uploadLimiter, upload.single('uploadedFile'), async (req, res) => {
  // Upload logic
});
```

---

## Performance Optimization

### 1. Optimize FFmpeg Settings

**Current Settings:**
```javascript
const resolutionConfigs = {
  '240p': { scale: '426:240', bitrate: '800k' },
  '360p': { scale: '640:360', bitrate: '1400k' },
  '720p': { scale: '1280:720', bitrate: '2800k' }
};
```

**Faster Processing (Lower Quality):**
```javascript
const resolutionConfigs = {
  '240p': { scale: '426:240', bitrate: '500k', preset: 'ultrafast' },
  '360p': { scale: '640:360', bitrate: '1000k', preset: 'ultrafast' },
  '720p': { scale: '1280:720', bitrate: '2000k', preset: 'ultrafast' }
};
```

**Better Quality (Slower Processing):**
```javascript
const resolutionConfigs = {
  '240p': { scale: '426:240', bitrate: '1000k', preset: 'slow' },
  '360p': { scale: '640:360', bitrate: '2000k', preset: 'slow' },
  '720p': { scale: '1280:720', bitrate: '4000k', preset: 'slow' }
};
```

### 2. Process Only Needed Resolutions

**Problem:** Always processing 3 resolutions wastes time

**Solution:** Process based on video size

```javascript
const determineResolutions = (videoWidth, videoHeight) => {
  const resolutions = [];
  
  if (videoHeight >= 240) resolutions.push('240p');
  if (videoHeight >= 360) resolutions.push('360p');
  if (videoHeight >= 720) resolutions.push('720p');
  
  return resolutions;
};

// In upload endpoint
const videoInfo = await getVideoInfo(filePath);
const resolutions = determineResolutions(videoInfo.width, videoInfo.height);
```

### 3. Parallel Resolution Processing

**Problem:** Processing resolutions one by one is slow

**Solution:** Process all resolutions simultaneously

```javascript
const processVideo = async (filePath, videoName, outputDir, resolutions) => {
  // Process all resolutions in parallel
  const promises = resolutions.map(res => 
    processResolution(filePath, outputDir, res)
  );
  
  await Promise.all(promises);
  
  // Generate master playlist
  generateMasterPlaylist(outputDir, resolutions);
};
```

**⚠️ Warning:** This uses more CPU/memory. Only use if you have powerful server.

---

## Scaling Strategies

### Current Setup (Single Server)

```mermaid
graph TB
    A[Users] --> B[Single Server]
    B --> C[Redis]
    B --> D[MongoDB]
    B --> E[MinIO]
    
    subgraph "Single Server"
        B1[API]
        B2[Worker]
    end
```

**Limitations:**
- Can only process 1 video at a time
- If server crashes, everything stops
- Limited by single server resources

### Scaled Setup (Multiple Workers)

```mermaid
graph TB
    A[Users] --> LB[Load Balancer]
    LB --> S1[API Server 1]
    LB --> S2[API Server 2]
    
    S1 --> R[Redis Queue]
    S2 --> R
    
    R --> W1[Worker Server 1]
    R --> W2[Worker Server 2]
    R --> W3[Worker Server 3]
    
    W1 --> M[MinIO]
    W2 --> M
    W3 --> M
    
    W1 --> DB[MongoDB]
    W2 --> DB
    W3 --> DB
```

**Benefits:**
- Process 3 videos simultaneously (3 workers)
- If one worker crashes, others continue
- API servers separate from workers

**Implementation:**

1. **Separate API and Worker Servers:**

```javascript
// api-server.js (handles uploads only)
const app = express();
app.post('/api/upload', uploadHandler);
app.listen(3000);

// worker-server.js (processes videos only)
videoProcessingQueue.process('process-video', 1, processVideo);
```

2. **Run Multiple Worker Servers:**

```bash
# Server 1
node worker-server.js

# Server 2
node worker-server.js

# Server 3
node worker-server.js
```

All workers connect to same Redis, so they share the queue!

### Horizontal Scaling with Docker

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  api:
    build: .
    command: node api-server.js
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    deploy:
      replicas: 2  # 2 API servers

  worker:
    build: .
    command: node worker-server.js
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    deploy:
      replicas: 3  # 3 worker servers

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

**Start scaled system:**
```bash
docker-compose up --scale api=2 --scale worker=3
```

---

## Monitoring and Alerts

### 1. Set Up Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log queue events
videoProcessingQueue.on('completed', (job) => {
  logger.info('Job completed', {
    jobId: job.id,
    lectureId: job.data.lectureId,
    duration: Date.now() - job.timestamp
  });
});

videoProcessingQueue.on('failed', (job, error) => {
  logger.error('Job failed', {
    jobId: job.id,
    lectureId: job.data.lectureId,
    error: error.message,
    stack: error.stack
  });
});
```

### 2. Set Up Alerts

```javascript
const sendAlert = async (message) => {
  // Send email, Slack message, etc.
  await sendEmail({
    to: 'admin@example.com',
    subject: 'Video Processing Alert',
    body: message
  });
};

// Alert on high failure rate
videoProcessingQueue.on('failed', async (job, error) => {
  const failedCount = await videoProcessingQueue.getFailedCount();
  
  if (failedCount > 10) {
    await sendAlert(`High failure rate: ${failedCount} failed jobs`);
  }
});

// Alert on queue backup
setInterval(async () => {
  const waitingCount = await videoProcessingQueue.getWaitingCount();
  
  if (waitingCount > 50) {
    await sendAlert(`Queue backup: ${waitingCount} jobs waiting`);
  }
}, 5 * 60 * 1000); // Check every 5 minutes
```

### 3. Metrics Dashboard

```javascript
app.get('/api/metrics', async (req, res) => {
  const [waiting, active, completed, failed] = await Promise.all([
    videoProcessingQueue.getWaitingCount(),
    videoProcessingQueue.getActiveCount(),
    videoProcessingQueue.getCompletedCount(),
    videoProcessingQueue.getFailedCount()
  ]);
  
  const jobs = await videoProcessingQueue.getJobs(['completed'], 0, 100);
  const avgProcessingTime = jobs.reduce((sum, job) => {
    return sum + (job.finishedOn - job.processedOn);
  }, 0) / jobs.length;
  
  res.json({
    queue: { waiting, active, completed, failed },
    performance: {
      avgProcessingTime: Math.round(avgProcessingTime / 1000) + 's',
      throughput: jobs.length + ' jobs/hour'
    }
  });
});
```

---

## Best Practices

### 1. Always Use Absolute Paths

**❌ Bad:**
```javascript
const filePath = 'public/uploads/video.mp4';
```

**✅ Good:**
```javascript
const filePath = path.resolve('public/uploads/video.mp4');
// Result: /Users/username/project/public/uploads/video.mp4
```

**Why:** Worker process might run from different directory.

### 2. Validate Files Before Processing

**✅ Good:**
```javascript
// Check file exists
if (!fs.existsSync(filePath)) {
  throw new Error('File not found');
}

// Check file size
const stats = fs.statSync(filePath);
if (stats.size === 0) {
  throw new Error('File is empty');
}
if (stats.size > 500 * 1024 * 1024) {
  throw new Error('File too large (max 500MB)');
}

// Check file type
const allowedTypes = ['.mp4', '.mov', '.m4v'];
const ext = path.extname(filePath).toLowerCase();
if (!allowedTypes.includes(ext)) {
  throw new Error('Invalid file type');
}
```

### 3. Clean Up Files After Processing

**✅ Good:**
```javascript
try {
  // Process video
  await processVideo(filePath);
  
  // Upload to cloud
  await uploadToMinIO(outputDir);
  
  // Clean up local files
  fs.unlinkSync(filePath);           // Delete original
  fs.rmSync(outputDir, { recursive: true }); // Delete processed
} catch (error) {
  // Still clean up on error
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  throw error;
}
```

### 4. Use Environment Variables

**✅ Good:**
```javascript
// .env file
REDIS_URL=redis://localhost:6379
MONGODB_URI=mongodb://localhost:27017/mydb
MINIO_ENDPOINT=https://minio.example.com
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

// In code
const redisUrl = process.env.REDIS_URL;
const mongoUri = process.env.MONGODB_URI;
```

**Why:** Easy to change settings without code changes.

### 5. Handle Errors Gracefully

**✅ Good:**
```javascript
videoProcessingQueue.process('process-video', 1, async (job) => {
  try {
    await processVideo(job.data);
  } catch (error) {
    // Log error with context
    console.error('Processing failed:', {
      jobId: job.id,
      lectureId: job.data.lectureId,
      error: error.message,
      stack: error.stack
    });
    
    // Update database
    await Lecture.findByIdAndUpdate(job.data.lectureId, {
      processingStatus: 'failed',
      processingError: error.message
    });
    
    // Re-throw to mark job as failed
    throw error;
  }
});
```

### 6. Test Error Scenarios

**Test Cases:**
1. Upload invalid file type
2. Upload corrupted video
3. Upload very large file
4. Disconnect Redis during processing
5. Disconnect MinIO during upload
6. Kill worker during processing
7. Upload 10 videos simultaneously

### 7. Monitor Queue Health

**✅ Good:**
```javascript
// Check queue health every minute
setInterval(async () => {
  const waiting = await videoProcessingQueue.getWaitingCount();
  const failed = await videoProcessingQueue.getFailedCount();
  
  console.log(`Queue Health: ${waiting} waiting, ${failed} failed`);
  
  if (failed > 10) {
    console.error('⚠️ High failure rate!');
  }
  
  if (waiting > 50) {
    console.warn('⚠️ Queue backup!');
  }
}, 60 * 1000);
```

---

## Summary

### What We Built

1. **Async Video Processing System**
   - Users upload videos and get instant response
   - Videos process in background
   - Real-time status updates

2. **Bull Queue System**
   - Manages background jobs
   - Stores jobs in Redis
   - Workers process jobs one at a time

3. **Video Transcoding**
   - Converts videos to 3 resolutions (240p, 360p, 720p)
   - Creates HLS streaming format
   - Uploads to MinIO cloud storage

### Key Improvements Made

1. ✅ Changed from 2 to 1 concurrent worker (fixed alternating failures)
2. ✅ Added absolute paths (fixed file not found errors)
3. ✅ Added file validation (catch errors early)
4. ✅ Added better error messages (easier debugging)
5. ✅ Created diagnostic scripts (easy troubleshooting)

### System Status

**✅ Working:**
- Video upload
- Queue processing
- FFmpeg transcoding
- Status updates
- Error handling

**⚠️ Needs Improvement:**
- MinIO upload timeouts (add retry logic)
- No progress tracking (add job progress)
- No monitoring dashboard (add Bull Board)
- No alerts (add email/Slack notifications)

### Next Steps for Production

1. **Add Retry Logic** - Automatically retry failed jobs
2. **Add Monitoring** - Set up Bull Board dashboard
3. **Add Alerts** - Email/Slack notifications for failures
4. **Add Progress Tracking** - Show upload/processing progress
5. **Scale Workers** - Run multiple worker servers
6. **Add Tests** - Test error scenarios
7. **Add Logging** - Structured logging with Winston
8. **Add Rate Limiting** - Prevent abuse

---

## Quick Reference

### Useful Commands

```bash
# Check queue status
node Backend/migrations/checkQueueStatus.js

# Check lecture status
node Backend/migrations/checkProcessingStatus.js

# Delete failed lectures
node Backend/migrations/deleteFailedLectures.js

# Delete stuck lectures
node Backend/migrations/deleteStuckPendingLectures.js

# Clean queue
node Backend/migrations/cleanFailedQueue.js

# Full cleanup
node Backend/migrations/fullCleanup.js

# Test system
node Backend/migrations/testVideoProcessing.js
```

### Important Files

- `Backend/routes/videoprocessingroutes/upload.js` - Upload endpoint & worker
- `Backend/routes/videoprocessingroutes/cloud.js` - MinIO upload logic
- `Backend/models/lecturemodel.js` - Lecture database schema
- `Backend/.env` - Configuration (Redis, MongoDB, MinIO)
- `Backend/migrations/` - Diagnostic and cleanup scripts

### Environment Variables

```env
REDIS_URL=redis://default:password@host:6379/0
MONGODB_URI=mongodb://username:password@host:27017/database
MINIO_BROWSER_REDIRECT_URL=https://minio.example.com
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET_NAME=your-bucket
```

---

## Resources

- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [HLS Streaming Guide](https://developer.apple.com/streaming/)
- [Redis Documentation](https://redis.io/documentation)
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)

---

**Created:** December 7, 2024  
**Last Updated:** December 7, 2024  
**Version:** 1.0


---

## FAQ - Frequently Asked Questions

### Q: When FFmpeg is processing a video, do other users have to wait?

**Answer: NO! Other users can use the app normally.**

#### Why Not?

Your Node.js server uses **asynchronous processing** and **separate processes**:

```mermaid
graph TB
    subgraph "Main Node.js Process (Event Loop)"
        A[User 1: Login Request] --> B[Auth Handler]
        C[User 2: Get Courses] --> D[Course Handler]
        E[User 3: Post Comment] --> F[Comment Handler]
    end
    
    subgraph "Separate FFmpeg Process"
        G[Video Processing]
    end
    
    B --> H[Response to User 1]
    D --> I[Response to User 2]
    F --> J[Response to User 3]
    
    style G fill:#f9f,stroke:#333
    style A fill:#bfb,stroke:#333
    style C fill:#bfb,stroke:#333
    style E fill:#bfb,stroke:#333
```

#### How It Works

1. **FFmpeg Runs in Separate Process**
   ```javascript
   // This creates a SEPARATE process (not blocking Node.js)
   const process = exec('ffmpeg -i video.mp4 ...');
   ```

2. **Node.js Event Loop Stays Free**
   ```javascript
   // While FFmpeg is running in background...
   app.post('/api/login', (req, res) => {
     // This still works instantly!
     // Node.js event loop is not blocked
   });
   
   app.get('/api/courses', (req, res) => {
     // This also works instantly!
   });
   ```

3. **Bull Worker Runs Asynchronously**
   ```javascript
   // Worker processes jobs in background
   videoProcessingQueue.process('process-video', 1, async (job) => {
     // This runs asynchronously
     // Doesn't block the main server
     await processVideo(job.data);
   });
   ```

#### Visual Example

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant U2 as User 2
    participant API as Express API
    participant W as Worker
    participant FF as FFmpeg Process

    Note over W,FF: Video processing happening...
    W->>FF: Processing video (5 minutes)
    
    Note over U1,API: Meanwhile, other requests work normally
    
    U1->>API: POST /api/login
    API-->>U1: ✓ Login successful (instant)
    
    U2->>API: GET /api/courses
    API-->>U2: ✓ Courses data (instant)
    
    U1->>API: POST /api/comment
    API-->>U1: ✓ Comment posted (instant)
    
    Note over FF: Still processing...
    
    U2->>API: GET /api/lectures
    API-->>U2: ✓ Lectures data (instant)
    
    FF-->>W: ✓ Processing complete
```

#### What WOULD Block Other Users?

**❌ Bad (Synchronous - Blocks Everything):**
```javascript
app.post('/api/upload', (req, res) => {
  // This would block the entire server!
  const result = processVideoSync(file); // Takes 5 minutes
  res.json(result);
});

// While processing, ALL other requests wait:
app.post('/api/login', (req, res) => {
  // User has to wait 5 minutes! ❌
});
```

**✅ Good (Asynchronous - Doesn't Block):**
```javascript
app.post('/api/upload', async (req, res) => {
  // Add to queue and return immediately
  await videoProcessingQueue.add('process-video', jobData);
  res.json({ status: 'processing' }); // Instant response!
});

// Other requests work normally:
app.post('/api/login', (req, res) => {
  // Works instantly! ✅
});
```

#### Performance Impact

**CPU Usage:**
- FFmpeg uses CPU heavily (50-80%)
- But Node.js event loop still has CPU time
- Other requests might be slightly slower (milliseconds)
- Not noticeable to users

**Memory Usage:**
- FFmpeg uses memory for video processing
- Node.js uses separate memory
- As long as server has enough RAM, no impact

**Real-World Example:**

```
Server: 4 CPU cores, 8GB RAM

While processing video:
- FFmpeg: Uses 2 cores, 2GB RAM
- Node.js: Uses 1 core, 500MB RAM
- Available: 1 core, 5.5GB RAM

Result: Other requests work fine!
```

#### When Would Users Notice Slowdown?

1. **Server Overloaded**
   - Processing 10 videos simultaneously
   - Server runs out of CPU/RAM
   - Solution: Scale to multiple servers

2. **Database Slow**
   - MongoDB query takes long
   - Not related to video processing
   - Solution: Optimize database queries

3. **Network Slow**
   - Slow internet connection
   - Not related to video processing
   - Solution: Use CDN, optimize assets

#### Testing This

You can test this yourself:

1. **Start video upload** (takes 2-5 minutes)
2. **While processing, try:**
   - Login/logout
   - Browse courses
   - Post comments
   - View lectures
   
All should work instantly!

#### Summary

✅ **Video processing does NOT block other requests**  
✅ **FFmpeg runs in separate process**  
✅ **Node.js event loop stays free**  
✅ **Other users experience no delay**  
✅ **Only CPU/RAM usage increases slightly**

---

### Q: What if 100 users upload videos at the same time?

**Answer: They all get instant response, but videos process one by one.**

#### What Happens

```mermaid
graph TB
    U1[User 1 Upload] --> Q[Queue]
    U2[User 2 Upload] --> Q
    U3[User 3 Upload] --> Q
    U4[User 100 Upload] --> Q
    
    Q --> W[Worker]
    W --> P1[Process Video 1]
    P1 --> P2[Process Video 2]
    P2 --> P3[Process Video 3]
    P3 --> P4[Process Video 100]
    
    U1 -.->|Instant Response| R1[202 Accepted]
    U2 -.->|Instant Response| R2[202 Accepted]
    U3 -.->|Instant Response| R3[202 Accepted]
    U4 -.->|Instant Response| R4[202 Accepted]
```

**Timeline:**
- User 1: Upload → Instant response → Processing starts immediately
- User 2: Upload → Instant response → Waits in queue
- User 3: Upload → Instant response → Waits in queue
- ...
- User 100: Upload → Instant response → Waits in queue

**Processing Time:**
- Each video: ~3 minutes
- 100 videos: ~300 minutes (5 hours)
- Last user waits 5 hours for their video

#### Solutions for High Load

**1. Add More Workers**
```javascript
// Run 5 workers on different servers
// Each processes 1 video at a time
// Total: 5 videos processing simultaneously

// Server 1
videoProcessingQueue.process('process-video', 1, processVideo);

// Server 2
videoProcessingQueue.process('process-video', 1, processVideo);

// Server 3-5: Same
```

**Result:** 100 videos in ~60 minutes (5x faster)

**2. Priority Queue**
```javascript
// Premium users get priority
await videoProcessingQueue.add('process-video', jobData, {
  priority: user.isPremium ? 1 : 10 // Lower number = higher priority
});
```

**3. Notify Users**
```javascript
// Tell users their position in queue
const waitingCount = await videoProcessingQueue.getWaitingCount();
const estimatedTime = waitingCount * 3; // 3 minutes per video

res.json({
  status: 'queued',
  position: waitingCount + 1,
  estimatedWaitTime: `${estimatedTime} minutes`
});
```

---

### Q: Can I increase concurrent workers to process faster?

**Answer: Yes, but carefully!**

#### Current Setup (1 Worker)

```javascript
videoProcessingQueue.process('process-video', 1, async (job) => {
  // Process 1 video at a time
});
```

**Pros:**
- ✅ Reliable (no resource conflicts)
- ✅ Predictable performance
- ✅ No failures

**Cons:**
- ❌ Slow for multiple uploads
- ❌ Queue can backup

#### Increasing to 2-3 Workers

```javascript
videoProcessingQueue.process('process-video', 3, async (job) => {
  // Process 3 videos simultaneously
});
```

**Pros:**
- ✅ 3x faster processing
- ✅ Better for high load

**Cons:**
- ⚠️ Uses 3x CPU/RAM
- ⚠️ May cause failures if server weak
- ⚠️ Need powerful server

#### Server Requirements

**For 1 Worker:**
- CPU: 2 cores
- RAM: 4GB
- Works on basic server

**For 3 Workers:**
- CPU: 6-8 cores
- RAM: 12-16GB
- Needs powerful server

#### Best Practice

**Option 1: Single Server, 1 Worker**
```javascript
// Good for: Small apps, limited budget
videoProcessingQueue.process('process-video', 1, processVideo);
```

**Option 2: Multiple Servers, 1 Worker Each**
```javascript
// Good for: Growing apps, better reliability
// Server 1, 2, 3: Each runs 1 worker
// Total: 3 videos processing simultaneously
videoProcessingQueue.process('process-video', 1, processVideo);
```

**Option 3: Powerful Server, 3 Workers**
```javascript
// Good for: High load, powerful server
videoProcessingQueue.process('process-video', 3, processVideo);
```

#### Testing Concurrent Workers

```javascript
// Start with 1, test with load
videoProcessingQueue.process('process-video', 1, processVideo);

// If server handles it well, try 2
videoProcessingQueue.process('process-video', 2, processVideo);

// Monitor CPU/RAM usage
// If usage < 70%, can increase
// If usage > 90%, decrease
```

---
