const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for all requests
app.use(cors());

// Serve static files from the assets directory
app.use('/assets', express.static(path.join(__dirname, '../assets')));

app.listen(port, '0.0.0.0', () => {
    console.log(`Asset server running at http://localhost:${port}`);
    console.log(`For external access: http://<your-ip-address>:${port}`);
  });