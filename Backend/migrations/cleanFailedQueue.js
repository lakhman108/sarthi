const Queue = require('bull');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function cleanFailedQueue() {
  try {
    const videoProcessingQueue = new Queue('video processing', process.env.REDIS_URL);
    
    console.log('[CLEAN] Cleaning failed jobs from queue...\n');

    const failedCount = await videoProcessingQueue.getFailedCount();
    console.log(`[CLEAN] Found ${failedCount} failed jobs`);

    if (failedCount > 0) {
      await videoProcessingQueue.clean(0, 'failed');
      console.log('[CLEAN] Removed all failed jobs from queue');
    }

    const completedCount = await videoProcessingQueue.getCompletedCount();
    console.log(`[CLEAN] Found ${completedCount} completed jobs`);
    
    if (completedCount > 0) {
      await videoProcessingQueue.clean(3600000, 'completed');
      console.log('[CLEAN] Cleaned old completed jobs');
    }

    const waiting = await videoProcessingQueue.getWaitingCount();
    const active = await videoProcessingQueue.getActiveCount();
    const completed = await videoProcessingQueue.getCompletedCount();
    const failed = await videoProcessingQueue.getFailedCount();

    console.log('\n[CLEAN] Final Queue Status:');
    console.log(`  Waiting: ${waiting}`);
    console.log(`  Active: ${active}`);
    console.log(`  Completed: ${completed}`);
    console.log(`  Failed: ${failed}`);

    await videoProcessingQueue.close();
    console.log('\n[CLEAN] Queue cleaned successfully');
    process.exit(0);
  } catch (error) {
    console.error('[CLEAN] Error:', error);
    process.exit(1);
  }
}

cleanFailedQueue();
