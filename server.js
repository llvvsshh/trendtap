// server.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Explicit CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

const PORT = process.env.PORT || 5000;

// YouTube Trending
app.get('/api/youtube-trends', async (req, res) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'snippet',
        chart: 'mostPopular',
        regionCode: 'US',
        maxResults: 10,
        key: process.env.YOUTUBE_API_KEY,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('YouTube API error:', error.message);
    res.status(500).json({ error: 'YouTube fetch failed' });
  }
});

// Reddit
app.get('/api/reddit-hot', async (req, res) => {
  try {
    const response = await axios.get('https://www.reddit.com/r/popular/hot.json?limit=10', {
      headers: { 'User-Agent': 'TrendTapBot/1.0' },
    });
    const posts = response.data.data.children.map(post => ({
      title: post.data.title,
      subreddit: post.data.subreddit,
      url: `https://reddit.com${post.data.permalink}`
    }));
    res.json(posts);
  } catch (error) {
    console.error('Reddit API error:', error.message);
    res.status(500).json({ error: 'Reddit fetch failed' });
  }
});

// TikTok
app.get('/api/tiktok-trending', async (req, res) => {
  try {
    const response = await axios.get('https://trending.tiktokapi.dev/');
    const videos = response.data.map(item => ({
      title: item.title,
      video_url: item.video_url,
      likes: item.likes,
    }));
    res.json(videos);
  } catch (error) {
    console.error('TikTok API error:', error.message);
    res.status(500).json({ error: 'TikTok fetch failed' });
  }
});

// Google Trends
app.get('/api/google-trends', async (req, res) => {
  try {
    const response = await axios.get('https://trends24.in/united-states/');
    const matches = [...response.data.matchAll(/<a href="(\/topic\/.*?)">(.*?)<\/a>/g)];
    const trends = matches.map(m => ({
      topic: m[2],
      search_url: `https://trends.google.com${m[1]}`
    }));
    res.json(trends.slice(0, 10));
  } catch (error) {
    console.error('Google Trends error:', error.message);
    res.status(500).json({ error: 'Google Trends fetch failed' });
  }
});

// Apple Music
app.get('/api/apple-trending', async (req, res) => {
  try {
    const response = await axios.get('https://api.apify.com/v2/datasets/9AhvSb7u4AYkNg9GJ/items?format=json');
    const tracks = response.data.map(item => ({
      track_name: item.trackName,
      artist: item.artistName,
      cover: item.coverUrl,
    }));
    res.json(tracks.slice(0, 10));
  } catch (error) {
    console.error('Apple Music API error:', error.message);
    res.status(500).json({ error: 'Apple Music fetch failed' });
  }
});

// Placeholder for Spotify and Twitter
app.get('/api/spotify-viral', (req, res) => {
  res.status(501).json({ error: 'Spotify integration coming soon' });
});

app.get('/api/x-trending', (req, res) => {
  res.status(501).json({ error: 'Twitter/X integration coming soon' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
