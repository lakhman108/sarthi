// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const { swaggerUi, swaggerSpec } = require('./swagger');
const { rateLimit }=require('express-rate-limit');

const allowedOrigins = process.env.FRONTEND_HOST
  ? process.env.FRONTEND_HOST.split(',').map(origin => origin.trim())
  : [];

const coreOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // legacy browser support
};


console.log(coreOptions);

// Trust proxy - required for rate limiting behind reverse proxy (Coolify/nginx)
// This MUST be set before any rate limiting middleware
if (process.env.ENVIRONMENT === 'production') {
  app.set('trust proxy', 1); // Trust first proxy in production
} else {
  app.set('trust proxy', false); // Don't trust proxy in development
}

app.use(cors(coreOptions));
// Connect to MongoDB
const uri = process.env.MONGODB_URI;
mongoose.connect(uri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB successfully!');
});

// Rate Limiter - Only enable in production
if (process.env.ENVIRONMENT === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: process.env.LIMIT || 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    // Trust proxy is already set above, no need to set it here again
  });
  
  // Apply rate limiting to all requests in production
  app.use(limiter);
  console.log('[RATE LIMIT] Rate limiting enabled for production');
} else {
  console.log('[RATE LIMIT] Rate limiting disabled for development');
}

// Middleware
app.use(bodyParser.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// BullMQ Board Setup
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const queueManager = require('./config/queue');

// Get queue instance from our singleton
const videoProcessingQueue = queueManager.getQueue('video-processing');

// Setup Bull Board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(videoProcessingQueue)],
  serverAdapter: serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());
console.log('[QUEUE] Bull Board dashboard available at /admin/queues');

// Routes
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const lectureRoutes = require('./routes/lectureroutes');
const videoRoutes=require('./routes/videoprocessingroutes/upload');
const enrollmentRoutes = require('./routes/enrollmentroutes');

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/upload', videoRoutes);
app.use('/api/hls', express.static(path.join(__dirname, 'public/hls')));
app.use('/api/enrollments', enrollmentRoutes);


app.get("/", (req, res) => {
  const some = {
    "keys": "this is something that i am learning"
  };
  res.send(some);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on ${process.env.HOST}`);
});
