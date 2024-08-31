// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB successfully!');
});

// Middleware
app.use(bodyParser.json());

// Routes
const userRoutes = require('./Backend/routes/user');
// const courseRoutes = require('./routes/course');
// const lectureRoutes = require('./routes/lecture');
// const enrollmentRoutes = require('./routes/enrollment');

app.use('/api/users', userRoutes);
// app.use('/api/courses', courseRoutes);
// app.use('/api/lectures', lectureRoutes);
// app.use('/api/enrollments', enrollmentRoutes);

app.get("/", (req, res) => {
  const some = {
    "keys": "this is something that i am learning"
  };
  res.send(some);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
