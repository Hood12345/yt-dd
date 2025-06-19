const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    res.setHeader('Content-Type', 'video/mp4');

    const ytDlp = spawn('yt-dlp', [
      '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      '--merge-output-format', 'mp4',
      '-o', '-', // output to stdout
      url
    ]);

    ytDlp.stdout.pipe(res);

    ytDlp.stderr.on('data', data => {
      console.error('[yt-dlp]', data.toString());
    });

    ytDlp.on('error', err => {
      console.error('[yt-dlp error]', err);
      res.status(500).end('yt-dlp error');
    });

    ytDlp.on('close', code => {
      if (code !== 0) {
        console.error(`[yt-dlp exited with code ${code}]`);
      }
    });

  } catch (err) {
    console.error('[Unhandled Error]', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.listen(3000, () => {
  console.log('✅ YouTube downloader running on port 3000');
});
