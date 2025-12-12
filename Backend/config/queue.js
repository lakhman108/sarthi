const { Queue, Worker } = require('bullmq');

require('dotenv').config();
class QueueManager {
  constructor() {
    this.queues = new Map();
    this.workers = new Map();
    this.environment = process.env.ENVIRONMENT || 'production';
  }

  getQueue(queueName = 'video-processing') {
    const fullQueueName = `${queueName}-${this.environment}`;
    
    if (!this.queues.has(fullQueueName)) {
      const queue = new Queue(fullQueueName, {
        connection: {
          url: process.env.REDIS_URL
        }
      });
      
      this.queues.set(fullQueueName, queue);
      console.log(`[QUEUE] Created BullMQ queue: ${fullQueueName} with Redis URL`);
    }
    
    return this.queues.get(fullQueueName);
  }

  createWorker(queueName = 'video-processing', processor, options = {}) {
    const fullQueueName = `${queueName}-${this.environment}`;
    
    if (!this.workers.has(fullQueueName)) {
      const worker = new Worker(fullQueueName, processor, {
        connection: {
          url: process.env.REDIS_URL
        },
        concurrency: 1,
        ...options
      });

      // Worker event listeners
      worker.on('completed', (job) => {
        console.log(`[WORKER] Job ${job.id} completed successfully`);
      });

      worker.on('failed', (job, err) => {
        console.error(`[WORKER] Job ${job?.id} failed:`, err.message);
      });

      worker.on('error', (err) => {
        console.error('[WORKER] Worker error:', err);
      });

      this.workers.set(fullQueueName, worker);
      console.log(`[WORKER] Created BullMQ worker: ${fullQueueName} with Redis URL`);
    }
    
    return this.workers.get(fullQueueName);
  }
}

// Singleton instance
const queueManager = new QueueManager();

module.exports = queueManager;