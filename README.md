# ARDrone Image Uploader

An Express.js application for uploading drone images with metadata to ARDrive.

## Features

- Upload images with metadata (drone ID, flight ID, geolocation)
- Store files on ARDrive with permanent storage
- Automatic cleanup of temporary files
- CORS enabled for frontend integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with:
```
PORT=3000
ARDRIVE_PRIVATE_KEY=your_private_key_here
```

3. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Usage

### Upload Image

**Endpoint:** `POST /upload`

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `image`: The image file to upload
- `droneId`: ID of the drone
- `flightId`: ID of the flight
- `latitude`: Latitude coordinate
- `longitude`: Longitude coordinate

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "arweaveId": "transaction_id",
    "arweaveUrl": "https://arweave.net/transaction_id",
    "metadata": {
      "droneId": "drone_id",
      "flightId": "flight_id",
      "latitude": "latitude",
      "longitude": "longitude",
      "uploadDate": "timestamp"
    }
  }
}
```

## Error Handling

The API returns appropriate error messages for:
- Missing files
- Missing metadata
- Upload failures
- Server errors 