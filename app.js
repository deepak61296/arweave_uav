require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { TurboFactory } = require('@ardrive/turbo-sdk');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Initialize ARDrive Turbo client
const turbo = TurboFactory.authenticated({
  privateKey: process.env.ARDRIVE_PRIVATE_KEY // You'll need to set this in .env
});

// Upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { droneId, flightId, latitude, longitude } = req.body;

    if (!droneId || !flightId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required metadata' });
    }

    const filePath = req.file.path;
    const fileSize = fs.statSync(filePath).size;

    // Upload to ARDrive with metadata
    const result = await turbo.uploadFile({
      fileStreamFactory: () => fs.createReadStream(filePath),
      fileSizeFactory: () => fileSize,
      dataItemOpts: {
        tags: [
          { name: "Content-Type", value: req.file.mimetype },
          { name: "Drone-ID", value: droneId },
          { name: "Flight-ID", value: flightId },
          { name: "Latitude", value: latitude },
          { name: "Longitude", value: longitude },
          { name: "Upload-Date", value: new Date().toISOString() }
        ]
      }
    });

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        arweaveId: result.id,
        arweaveUrl: `https://arweave.net/${result.id}`,
        metadata: {
          droneId,
          flightId,
          latitude,
          longitude,
          uploadDate: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 