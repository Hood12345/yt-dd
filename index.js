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
      '-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/best',
      '-o', '-', // stdout stream
      url
    ]);

    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-f', 'mp4',
      '-movflags', 'frag_keyframe+empty_moov',
      '-loglevel', 'quiet',
      'pipe:1'
    ]);

    ytDlp.stderr.on('data', data => console.error('[yt-dlp]', data.toString()));
    ffmpeg.stderr.on('data', data => console.error('[ffmpeg]', data.toString()));

    ytDlp.on('error', err => {
      console.error('[yt-dlp error]', err);
      return res.status(500).json({ error: 'yt-dlp failed to start' });
    });

    ffmpeg.on('error', err => {
      console.error('[ffmpeg error]', err);
      return res.status(500).json({ error: 'ffmpeg failed to start' });
    });

    ytDlp.on('close', code => {
      if (code !== 0) {
        console.error(`[yt-dlp exited with code ${code}]`);
      }
    });

    ffmpeg.on('close', code => {
      if (code !== 0) {
        console.error(`[ffmpeg exited with code ${code}]`);
      }
    });

    ytDlp.stdout.pipe(ffmpeg.stdin);
    ffmpeg.stdout.pipe(res);

  } catch (err) {
    console.error('[Unhandled Error]', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.listen(3000, () => {
  console.log('✅ Streaming downloader running on port 3000');
});
