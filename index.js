const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const igDownloader = require('./ig-dd'); // ✅ Added for Instagram

const app = express();
app.use(cors());
app.use(express.json());

app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  const fileName = `video_${Date.now()}.mp4`;
  const filePath = path.join(__dirname, fileName);

  // ✅ Updated line to fetch best video+audio and merge to MP4
  exec(`yt-dlp -f "bv*+ba/best" --merge-output-format mp4 -o "${filePath}" "${url}"`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Download failed', details: stderr || error.message });
    }

    // Send the video file
    res.download(filePath, fileName, (err) => {
      // Clean up the downloaded file after serving it
      fs.unlink(filePath, () => {});
    });
  });
});

app.use('/', igDownloader); // ✅ Mount Instagram endpoint

app.listen(3000, () => {
  console.log('✅ YouTube Downloader running on port 3000');
});
