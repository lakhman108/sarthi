const Queue = require('bull');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkQueueStatus() {
  try {
    const videoProcessingQueue = new Queue('video processing', process.env.REDIS_URL);
    
    console.log('[QUEUE] Checking queue status...\n');

    const waiting = await videoProcessingQueue.getWaitingCount();
    const active = await videoProcessingQueue.getActiveCount();
    const completed = await videoProcessingQueue.getCompletedCount();
    const failed = await videoProcessingQueue.getFailedCount();
    const delayed = await videoProcessingQueue.getDelayedCount();

    console.log('Queue Statistics:');
    console.log(`  Waiting: ${waiting}`);
    console.log(`  Active: ${active}`);
    console.log(`  Completed: ${completed}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Delayed: ${delayed}`);

    const failedJobs = await videoProcessingQueue.getFailed(0, 10);
    
    if (failedJobs.length > 0) {
      console.log(`\n[FAILED JOBS] Found ${failedJobs.length} failed jobs:\n`);
      
      failedJobs.forEach((job, index) => {
        console.log(`Job ${index + 1}:`);
        console.log(`  ID: ${job.id}`);
        console.log(`  Lecture ID: ${job.data.lectureId}`);
        console.log(`  Video Name: ${job.data.videoName}`);
        console.log(`  Failed Reason: ${job.failedReason}`);
        console.log(`  Stack Trace: ${job.stacktrace ? job.stacktrace[0] : 'N/A'}`);
        console.log('');
      });
    }

    const activeJobs = await videoProcessingQueue.getActive(0, 10);
    
    if (activeJobs.length > 0) {
      console.log(`[ACTIVE JOBS] Found ${activeJobs.length} active jobs:\n`);
      
      activeJobs.forEach((job, index) => {
        console.log(`Job ${index + 1}:`);
        console.log(`  ID: ${job.id}`);
        console.log(`  Lecture ID: ${job.data.lectureId}`);
        console.log(`  Video Name: ${job.data.videoName}`);
        console.log('');
      });
    }

    const waitingJobs = await videoProcessingQueue.getWaiting(0, 10);
    
    if (waitingJobs.length > 0) {
      console.log(`[WAITING JOBS] Found ${waitingJobs.length} waiting jobs:\n`);
      
      waitingJobs.forEach((job, index) => {
        console.log(`Job ${index + 1}:`);
        console.log(`  ID: ${job.id}`);
        console.log(`  Lecture ID: ${job.data.lectureId}`);
        console.log(`  Video Name: ${job.data.videoName}`);
        console.log('');
      });
    }

    await videoProcessingQueue.close();
    console.log('[QUEUE] Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('[QUEUE] Error:', error);
    process.exit(1);
  }
}

checkQueueStatus();
