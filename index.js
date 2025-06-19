const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

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

  // Run yt-dlp to download the video to filePath
  exec(`yt-dlp -f 'best[ext=mp4]' -o "${filePath}" "${url}"`, (error, stdout, stderr) => {
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

app.listen(3000, () => {
  console.log('✅ YouTube Downloader running on port 3000');
});
