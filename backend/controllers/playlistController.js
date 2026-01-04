const Playlist = require('../models/Playlist');
const Progress = require('../models/Progress');
const axios = require('axios');
const ytpl = require('ytpl');

// Helper to parse ISO 8601 duration
// P1DT1H1M1S
const parseDuration = (duration) => {
    if (!duration) return 0;
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);
    return hours * 3600 + minutes * 60 + seconds;
};

// Mock Data Generator
const generateMockPlaylist = (playlistId) => {
    const videos = [];
    let totalDuration = 0;
    for (let i = 1; i <= 100; i++) {
        const durationSec = Math.floor(Math.random() * 3000) + 300; // 5-55 mins
        totalDuration += durationSec;
        videos.push({
            videoId: `mock-vid-${i}`,
            title: `Java Programming Tutorial #${i} - Complete Guide`,
            description: `This is video number ${i} in the comprehensive Java series.`,
            thumbnail: 'https://i.ytimg.com/vi/eIrMbAQSU34/hqdefault.jpg', // Generic java thumb
            channelTitle: 'ProgrammingKnowledge',
            position: i - 1,
            durationISO: 'PT' + Math.floor(durationSec / 60) + 'M',
            durationSeconds: durationSec
        });
    }

    return {
        youtubeId: playlistId,
        title: 'Complete Java Programming Course (100 Videos)',
        description: 'Learn Java from scratch to expert level with this 100-video playlist.',
        thumbnail: 'https://i.ytimg.com/vi/eIrMbAQSU34/hqdefault.jpg',
        channelTitle: 'ProgrammingKnowledge',
        videoCount: 100,
        videos: videos,
        totalDurationSeconds: totalDuration
    };
};

const fetchYouTubePlaylist = async (playlistId) => {
    // Explicit demo mode
    if (playlistId === 'demo-java') {
        return generateMockPlaylist(playlistId);
    }

    // 1. Try Official API if Key exists
    if (process.env.YOUTUBE_API_KEY) {
        try {
            const API_KEY = process.env.YOUTUBE_API_KEY;
            const baseUrl = 'https://www.googleapis.com/youtube/v3';

            const plResponse = await axios.get(`${baseUrl}/playlists`, {
                params: { part: 'snippet,contentDetails', id: playlistId, key: API_KEY }
            });

            if (!plResponse.data.items.length) {
                console.log('Playlist not found via API, failing over to scraper');
                throw new Error('Playlist not found via API');
            }
            const plItem = plResponse.data.items[0];

            let videos = [];
            let nextPageToken = '';

            do {
                const vidResponse = await axios.get(`${baseUrl}/playlistItems`, {
                    params: {
                        part: 'snippet,contentDetails',
                        playlistId: playlistId,
                        maxResults: 50,
                        key: API_KEY,
                        pageToken: nextPageToken
                    }
                });

                const videoItems = vidResponse.data.items;
                const videoIds = videoItems.map(v => v.contentDetails.videoId).join(',');

                const durResponse = await axios.get(`${baseUrl}/videos`, {
                    params: { part: 'contentDetails,snippet', id: videoIds, key: API_KEY }
                });

                const durMap = {};
                durResponse.data.items.forEach(v => {
                    durMap[v.id] = v.contentDetails.duration;
                });

                const mappedVideos = videoItems.map((item) => {
                    const vidId = item.contentDetails.videoId;
                    const durationISO = durMap[vidId] || 'PT0S';
                    return {
                        videoId: vidId,
                        title: item.snippet.title,
                        description: item.snippet.description,
                        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
                        channelTitle: item.snippet.channelTitle,
                        position: item.snippet.position,
                        durationISO: durationISO,
                        durationSeconds: parseDuration(durationISO)
                    };
                });

                videos = [...videos, ...mappedVideos];
                nextPageToken = vidResponse.data.nextPageToken;

            } while (nextPageToken);

            return {
                youtubeId: playlistId,
                title: plItem.snippet.title,
                description: plItem.snippet.description,
                thumbnail: plItem.snippet.thumbnails?.high?.url,
                channelTitle: plItem.snippet.channelTitle,
                videoCount: videos.length,
                videos: videos,
                totalDurationSeconds: videos.reduce((acc, v) => acc + v.durationSeconds, 0)
            };
        } catch (error) {
            console.log('API Fetch failed, trying fallback to scraper...', error.message);
        }
    }

    // 2. Fallback: Use URL Scraper (No API Key needed)
    try {
        console.log('Fetching via Scraper (ytpl) for:', playlistId);
        const playlist = await ytpl(playlistId, { limit: Infinity });

        const videos = playlist.items.map((item, index) => ({
            videoId: item.id,
            title: item.title,
            description: 'Imported via Scraper',
            thumbnail: item.bestThumbnail.url,
            channelTitle: item.author.name,
            position: index,
            durationISO: item.duration,
            durationSeconds: item.durationSec || 0
        }));

        return {
            youtubeId: playlistId,
            title: playlist.title,
            description: playlist.description,
            thumbnail: playlist.bestThumbnail.url,
            channelTitle: playlist.author.name,
            videoCount: playlist.estimatedItemCount,
            videos: videos,
            totalDurationSeconds: videos.reduce((acc, v) => acc + v.durationSeconds, 0)
        };
    } catch (error) {
        console.error('Scraper failed:', error);
        throw new Error('Failed to fetch playlist. Ensure it is valid and Public. Error: ' + error.message);
    }
};

// Add Playlist
exports.addPlaylist = async (req, res) => {
    const { url } = req.body;
    let playlistId = url;

    // Extract ID from URL
    // Supports: list=ID, or direct ID
    if (url.includes('list=')) {
        playlistId = url.split('list=')[1].split('&')[0];
    }

    try {
        // Check if already added by THIS user
        const existing = await Playlist.findOne({ user: req.user._id, youtubeId: playlistId });
        if (existing) {
            return res.status(200).json(existing);
        }

        const playlistData = await fetchYouTubePlaylist(playlistId);

        const newPlaylist = await Playlist.create({
            user: req.user._id,
            ...playlistData
        });

        res.status(201).json(newPlaylist);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch playlist. ' + error.message });
    }
};

// Get All Playlists for User
exports.getPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ user: req.user._id }).sort({ importedAt: -1 });

        // Calculate progress for each playlist to show on dashboard (summary)
        const playlistsWithProgress = await Promise.all(playlists.map(async (pl) => {
            const completedCount = await Progress.countDocuments({
                user: req.user._id,
                playlist: pl._id,
                status: 'COMPLETED'
            });
            return {
                ...pl.toObject(),
                completedCount,
                percent: pl.videoCount > 0 ? Math.round((completedCount / pl.videoCount) * 100) : 0
            };
        }));

        res.json(playlistsWithProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Single Playlist
exports.getPlaylistDetails = async (req, res) => {
    try {
        const playlist = await Playlist.findOne({ _id: req.params.id, user: req.user._id });
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

        // Get progress for all videos
        const progressDocs = await Progress.find({ user: req.user._id, playlist: playlist._id });
        const progressMap = {};
        progressDocs.forEach(p => {
            progressMap[p.videoId] = p.status;
        });

        // Merge status into video list
        const videosWithStatus = playlist.videos.map(v => ({
            ...v.toObject(),
            status: progressMap[v.videoId] || 'NOT_STARTED'
        }));

        res.json({
            ...playlist.toObject(),
            videos: videosWithStatus
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Playlist
exports.deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (playlist) {
            await Progress.deleteMany({ playlist: playlist._id });
            res.json({ message: 'Playlist removed' });
        } else {
            res.status(404).json({ message: 'Playlist not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
