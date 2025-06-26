app.post('/download', async (req, res) => {
  const { url } = req.body;
  const cookieHeader = req.headers['cookie'];

  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  const fileName = `video_${Date.now()}.mp4`;
  const filePath = path.join(__dirname, fileName);

  // Write a properly formatted cookies.txt file
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

    // Add the required Netscape header
    const fullCookieText = [
      '# Netscape HTTP Cookie File',
      '# This file was generated from an n8n request',
      ...cookieLines
    ].join('\n');

    fs.writeFileSync(cookieFilePath, fullCookieText);
    cookieFlag = '--cookies cookies.txt';
  }

  const command = `yt-dlp ${cookieFlag} -f "bv*+ba/best" --merge-output-format mp4 -o "${filePath}" "${url}"`;

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
