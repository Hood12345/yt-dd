const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const DOWNLOAD_DIR = "/tmp";

router.post('/download-instagram', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.includes("instagram.com")) {
    return res.status(400).json({ error: "Invalid Instagram URL" });
  }

  const fileName = `ig_${uuidv4()}.mp4`;
  const filePath = path.join(DOWNLOAD_DIR, fileName);

  const command = `yt-dlp -f mp4 -o "${filePath}" "${url}"`;

  exec(command, (err, stdout, stderr) => {
    if (err || !fs.existsSync(filePath)) {
      console.error(stderr || err.message);
      return res.status(500).json({ error: "Download failed", details: stderr || err.message });
    }

    res.download(filePath, "instagram_video.mp4", (err) => {
      fs.unlink(filePath, () => {});
    });
  });
});

module.exports = router;
