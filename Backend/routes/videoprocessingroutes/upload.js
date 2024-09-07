const express = require ('express');
const bodyParser = require ('body-parser');
const cors = require ('cors');
const path = require ('path');
const multer = require ('multer');

// constants
const app = express.Router();







// storage engine for multer
const storageEngine = multer.diskStorage ({
  destination: './public/uploads/',
  filename: function (req, file, callback) {
    callback (
      null,
      file.fieldname + '-' + Date.now () + path.extname (file.originalname)
    );
  },
});

  // file filter for multer
  const fileFilter = (req, file, callback) => {
    //i want to upload a video
    let pattern = /mp4|mov/; // reqex

    if (pattern.test (path.extname (file.originalname))) {
      callback (null, true);
    } else {
      callback ('Error: not a valid file');
    }
  };

// initialize multer
const upload = multer ({
  storage: storageEngine,
  fileFilter: fileFilter,
});

// routing
app.post ('/', upload.single ('uploadedFile'), (req, res) => {
  res.json (req.file).status (200);
});

module.exports=app;
