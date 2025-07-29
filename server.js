// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

// YouTube Trending Endpoint
app.get('/api/youtube-trends', async (req, res) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          part: 'snippet',
          chart: 'mostPopular',
          regionCode: 'US',
          maxResults: 10,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('YouTube API error:', error.message);
    res.status(500).json({ error: 'YouTube fetch failed' });
  }
});

// Reddit Hot Posts
app.get('/api/reddit-hot', async (req, res) => {
  try {
    const response = await axios.get('https://www.reddit.com/r/popular/hot.json?limit=10', {
      headers: { 'User-Agent': 'TrendTapBot/1.0' },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Reddit API error:', error.message);
    res.status(500).json({ error: 'Reddit fetch failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
