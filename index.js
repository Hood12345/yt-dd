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

  // Set headers for streaming download
  res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
  res.setHeader('Content-Type', 'video/mp4');

  // Stream video+audio merged from yt-dlp through ffmpeg
  const ytDlp = spawn('yt-dlp', [
    '-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/best',
    '-o', '-', // Output to stdout
    url
  ]);

  const ffmpeg = spawn('ffmpeg', [
    '-i', 'pipe:0',
    '-f', 'mp4',
    '-movflags', 'frag_keyframe+empty_moov',
    '-loglevel', 'quiet',
    'pipe:1'
  ]);

  ytDlp.stdout.pipe(ffmpeg.stdin);
  ffmpeg.stdout.pipe(res);

  ytDlp.stderr.on('data', data => console.error('yt-dlp error:', data.toString()));
  ffmpeg.stderr.on('data', data => console.error('ffmpeg error:', data.toString()));

  ytDlp.on('error', err => {
    console.error('yt-dlp failed:', err);
    res.status(500).end('yt-dlp error');
  });

  ffmpeg.on('error', err => {
    console.error('ffmpeg failed:', err);
    res.status(500).end('ffmpeg error');
  });
});
