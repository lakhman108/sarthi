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
const coreOptions = {
  origin: process.env.FRONTEND_HOST,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
console.log(coreOptions);
app.use(cors(coreOptions));
// Connect to MongoDB
const uri = process.env.MONGODB_URI;
mongoose.connect(uri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB successfully!');
});

// Rate Limiter

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: process.env.LIMIT, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})

// Applying the rate limiting middleware to all requests.
app.use(limiter)

// Middleware
app.use(bodyParser.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

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
