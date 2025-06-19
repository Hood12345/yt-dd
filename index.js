const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  // Use yt-dlp to extract direct video URL
  exec(`yt-dlp -f 'best[ext=mp4]' -g "${url}"`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Download failed', details: stderr || error.message });
    }

    const videoUrl = stdout.trim();
    return res.json({ download_url: videoUrl });
  });
});

app.listen(3000, () => {
  console.log('✅ YouTube Downloader running on port 3000');
});
