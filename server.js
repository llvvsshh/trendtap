// server.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// Spotify
app.get('/api/spotify-viral', async (req, res) => {
  try {
    const tokenRes = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        Authorization: 'Basic ' + Buffer.from('35fb675264394a01b270318f81118889:f40e1362c9fd42e58385dd99e3535e00').toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const token = tokenRes.data.access_token;

    const response = await axios.get('https://api.spotify.com/v1/playlists/37i9dQZEVXbLiRSasKsNU9', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const tracks = response.data.tracks.items.map(item => ({
      track_name: item.track.name,
      artist: item.track.artists[0].name,
      album_cover: item.track.album.images[0].url,
      spotify_url: item.track.external_urls.spotify
    })).filter(song =>
      song.artist.toLowerCase().match(/drake|sza|yeat|uzi|21 savage|lay bankz|gunna|future|tyla|ice spice|doja/)
    );

    res.json(tracks.slice(0, 10));
  } catch (error) {
    console.error("Spotify error:", error.message);
    res.status(500).json({ error: 'Spotify fetch failed' });
  }
});

// YouTube
app.get('/api/youtube-trends', async (req, res) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet',
        chart: 'mostPopular',
        regionCode: 'US',
        maxResults: 10,
        key: 'AIzaSyBA2Pn62u9kB4MZwIrnsWZNYEAe_kXmV_w',
      },
    });
    const filtered = response.data.items
      .filter(item => item.snippet.title.toLowerCase().match(/kai|amp|uzi|drake|challenge|meme|hip-hop|funny/))
      .map(item => ({
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${item.id}`
      }));
    res.json(filtered);
  } catch (error) {
    console.error("YouTube error:", error.message);
    res.status(500).json({ error: 'YouTube fetch failed' });
  }
});

// TikTok (simulated)
app.get('/api/tiktok-trending', async (req, res) => {
  try {
    const response = await axios.get('https://trending.tiktokapi.dev/');
    const videos = response.data.map(item => ({
      title: item.title,
      video_url: item.video_url,
      likes: item.likes
    })).filter(item =>
      item.title.toLowerCase().match(/meme|dance|funny|kai|lay bankz|uzi|challenge|trend|rizz|yeat|faze|amp|gunna/)
    );
    res.json(videos.slice(0, 10));
  } catch (error) {
    console.error("TikTok error:", error.message);
    res.status(500).json({ error: 'TikTok fetch failed' });
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
    })).filter(post =>
      post.subreddit.toLowerCase().match(/hiphopheads|memes|blackpeopletwitter/) ||
      post.title.toLowerCase().match(/drake|uzi|kai|meme|funny|beef|rap/)
    );
    res.json(posts);
  } catch (error) {
    console.error("Reddit error:", error.message);
    res.status(500).json({ error: 'Reddit fetch failed' });
  }
});

// Google Trends (scraped from trends24)
app.get('/api/google-trends', async (req, res) => {
  try {
    const response = await axios.get('https://trends24.in/united-states/');
    const matches = [...response.data.matchAll(/<a href="(\/topics\/.*?)">(.*?)<\/a>/g)];
    const trends = matches.map(m => ({
      topic: m[2],
      region: "United States",
      url: `https://twitter.com/search?q=${encodeURIComponent(m[2])}`
    })).filter(item =>
      item.topic.toLowerCase().match(/rap|drake|meme|uzi|kai|beef|trend|hiphop|faze|amp/)
    );
    res.json(trends.slice(0, 10));
  } catch (error) {
    console.error("Google Trends error:", error.message);
    res.status(500).json({ error: 'Google Trends fetch failed' });
  }
});

// Apple Music (example/fallback)
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
    console.error("Apple Music error:", error.message);
    res.status(500).json({ error: 'Apple Music fetch failed' });
  }
});

// Twitter/X via Trends24
app.get('/api/x-trending', async (req, res) => {
  try {
    const response = await axios.get('https://trends24.in/united-states/');
    const matches = [...response.data.matchAll(/<a href="(\/topics\/.*?)">(.*?)<\/a>/g)];
    const trends = matches.map(m => ({
      topic: m[2],
      region: "United States",
      url: `https://twitter.com/search?q=${encodeURIComponent(m[2])}`
    })).filter(item =>
      item.topic.toLowerCase().match(/rap|drake|meme|uzi|kai|beef|trend|hiphop|faze|amp/)
    );
    res.json(trends.slice(0, 10));
  } catch (error) {
    console.error("Twitter/X error:", error.message);
    res.status(500).json({ error: 'Twitter/X fetch failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
