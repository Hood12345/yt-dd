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
  const cookieHeader = req.headers['cookie'];

  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  const fileName = `video_${Date.now()}.mp4`;
  const filePath = path.join(__dirname, fileName);

  let cookieFlag = '';
  if (cookieHeader) {
    const cookieFilePath = path.join(__dirname, 'cookies.txt');

    const cookieLines = cookieHeader
      .split('; ')
      .map(line => {
        const [key, value] = line.split('=');
        if (!key || !value) return '';
        return `.youtube.com\tTRUE\t/\tFALSE\t0\t${key}\t${value}`;
      })
      .filter(Boolean);

    const fullCookieText = [
      '# Netscape HTTP Cookie File',
      '# This file was generated from n8n headers',
      ...cookieLines
    ].join('\n');

    fs.writeFileSync(cookieFilePath, fullCookieText);
    cookieFlag = '--cookies cookies.txt';
  }

  // ✅ Corrected yt-dlp command using PO Token HTTP provider
  const command = `yt-dlp ${cookieFlag} --extractor-args "youtube:player-client=mweb,youtubepot-bgutilhttp:base_url=http://127.0.0.1:4416" -f "bv*+ba/best" --merge-output-format mp4 -o "${filePath}" "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (cookieHeader) {
      fs.unlink(path.join(__dirname, 'cookies.txt'), () => {});
    }

    if (error) {
      return res.status(500).json({ error: 'Download failed', details: stderr || error.message });
    }

    res.download(filePath, fileName, () => {
      fs.unlink(filePath, () => {});
    });
  });
});

app.listen(3000, () => {
  console.log('✅ YouTube Downloader running on port 3000');
});
