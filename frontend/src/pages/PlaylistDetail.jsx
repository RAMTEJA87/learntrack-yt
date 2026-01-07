import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import YouTube from 'react-youtube';
import api from '../utils/api';
import ProgressBar from '../components/ProgressBar';
import StudyHeatmap from '../components/StudyHeatmap';
import NotesSection from '../components/NotesSection';
import { CheckCircle, Circle, Trash2, ArrowLeft, Play } from 'lucide-react';
import { clsx } from 'clsx';

const PlaylistDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialVideoId = searchParams.get('videoId');

    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeVideoId, setActiveVideoId] = useState(null);

    // refs for scrolling to the active item
    const listRef = useRef(null);
    const itemRefs = useRef({});

    const fetchPlaylist = async () => {
        try {
            const { data } = await api.get(`/api/playlists/${id}`);
            setPlaylist(data);
            // Auto-select first uncompleted video
            if (data.videos.length > 0) {
                if (initialVideoId && data.videos.some(v => v.videoId === initialVideoId)) {
                    setActiveVideoId(initialVideoId);
                } else {
                    const firstUnfinished = data.videos.find(v => v.status !== 'COMPLETED');
                    setActiveVideoId(firstUnfinished ? firstUnfinished.videoId : data.videos[0].videoId);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylist();
    }, [id]);

    // scroll to active video whenever playlist loads or activeVideoId changes
    useEffect(() => {
        if (!playlist || !activeVideoId) return;

        const idx = playlist.videos.findIndex(v => v.videoId === activeVideoId);

        const attemptScroll = () => {
            const el = itemRefs.current[idx];
            const container = listRef.current;
            if (!el || !container) return false;

            // compute exact scroll position using getBoundingClientRect to avoid layout shifts
            const elRect = el.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // delta: how many pixels the element is below the top of the container's viewport
            const delta = elRect.top - containerRect.top;

            // target scrollTop that puts the element at the very top of the container
            const target = Math.max(0, container.scrollTop + delta);

            // apply scroll (snap first to avoid overshoot, then smooth adjust)
            try {
                container.scrollTo({ top: target, behavior: 'auto' });
            } catch {
                container.scrollTop = target;
            }

            return true;
        };

        // Try immediately; if refs not attached yet, retry a couple times
        if (!attemptScroll()) {
            const t1 = setTimeout(() => attemptScroll(), 80);
            const t2 = setTimeout(() => {
                if (attemptScroll()) {
                    // smooth adjustment after layout/images finish loading
                    const el = itemRefs.current[idx];
                    const container = listRef.current;
                    if (el && container) {
                        const elRect = el.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();
                        const delta = elRect.top - containerRect.top;
                        const target = Math.max(0, container.scrollTop + delta);
                        try {
                            container.scrollTo({ top: target, behavior: 'smooth' });
                        } catch {
                            container.scrollTop = target;
                        }
                    }
                }
            }, 220);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        } else {
            // ensure a final smooth tweak after a short delay to account for image/font load shifts
            const t = setTimeout(() => {
                const el = itemRefs.current[idx];
                const container = listRef.current;
                if (el && container) {
                    const elRect = el.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    const delta = elRect.top - containerRect.top;
                    const target = Math.max(0, container.scrollTop + delta);
                    try {
                        container.scrollTo({ top: target, behavior: 'smooth' });
                    } catch {
                        container.scrollTop = target;
                    }
                }
            }, 180);
            return () => clearTimeout(t);
        }
    }, [playlist, activeVideoId]);

    const handleVideoEnd = async () => {
        if (activeVideoId) {
            console.log('Video Ended, marking as complete:', activeVideoId);
            const currentVideo = playlist.videos.find(v => v.videoId === activeVideoId);
            if (currentVideo && currentVideo.status !== 'COMPLETED') {
                await handleStatusUpdate(activeVideoId, 'NOT_STARTED'); // Will toggle to COMPLETED
            }
        }
    };

    const handleStatusUpdate = async (videoId, currentStatus) => {
        const newStatus = currentStatus === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';

        setPlaylist(prev => ({
            ...prev,
            videos: prev.videos.map(v => v.videoId === videoId ? { ...v, status: newStatus } : v)
        }));

        try {
            await api.post('/api/progress', {
                playlistId: id,
                videoId,
                status: newStatus
            });
        } catch (error) {
            console.error('Failed to update progress', error);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this playlist?')) {
            try {
                await api.delete(`/api/playlists/${id}`);
                navigate('/');
            } catch (error) {
                alert('Error deleting playlist');
            }
        }
    };

    const stats = useMemo(() => {
        if (!playlist) return { percent: 0, completed: 0, total: 0, remainingTime: 0 };
        const total = playlist.videos.length;
        const completed = playlist.videos.filter(v => v.status === 'COMPLETED').length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        const remainingSeconds = playlist.videos
            .filter(v => v.status !== 'COMPLETED')
            .reduce((acc, v) => acc + v.durationSeconds, 0);

        return { percent, completed, total, remainingSeconds };
    }, [playlist]);

    if (loading) return <div className="flex justify-center py-20">Loading...</div>;
    if (!playlist) return <div className="flex justify-center py-20">Playlist not found</div>;

    const activeVideo = playlist.videos.find(v => v.videoId === activeVideoId);

    return (
        <div className="animate-slide-up pb-20 max-w-[1600px] mx-auto">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
                <button onClick={handleDelete} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors" title="Delete Playlist">
                    <Trash2 size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Player & Current Video Info */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Player Container */}
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
                        {activeVideoId ? (
                            <YouTube
                                videoId={activeVideoId}
                                opts={{
                                    width: '100%',
                                    height: '100%',
                                    playerVars: {
                                        autoplay: 0,
                                    },
                                }}
                                className="w-full h-full"
                                onEnd={handleVideoEnd}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-500">
                                Select a video to play
                            </div>
                        )}
                    </div>

                    {/* Active Video Details */}
                    {activeVideo && (
                        <div className="bg-surface p-6 rounded-2xl border border-white/5">
                            <h1 className="text-xl md:text-2xl font-bold mb-2">{activeVideo.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
                                <span className={clsx("px-2 py-1 rounded", activeVideo.status === 'COMPLETED' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500")}>
                                    {activeVideo.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                                </span>
                                <span>{activeVideo.channelTitle}</span>
                            </div>
                            <p className="text-zinc-500 text-sm line-clamp-3">{activeVideo.description}</p>
                        </div>
                    )}

                    {/* Simple Playlist-Specific Heatmap */}
                    <StudyHeatmap playlistId={id} />

                    {/* Notes Section */}
                    {activeVideoId && (
                        <NotesSection playlistId={id} videoId={activeVideoId} />
                    )}
                </div>

                {/* Right Column: Playlist & Progress */}
                <div className="lg:col-span-1 flex flex-col h-[500px] lg:h-[calc(100vh-100px)] lg:sticky lg:top-24">
                    {/* Stats Card */}
                    <div className="bg-surface p-6 rounded-2xl border border-white/5 mb-4 shrink-0">
                        <h2 className="font-bold mb-4 truncate">{playlist.title}</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-primary">{stats.percent}% Completed</span>
                                <span className="text-zinc-400">{stats.completed}/{stats.total}</span>
                            </div>
                            <ProgressBar progress={stats.percent} className="h-2" />
                            <div className="text-xs text-zinc-500 text-right">
                                {Math.floor(stats.remainingSeconds / 3600)}h {Math.floor((stats.remainingSeconds % 3600) / 60)}m remaining
                            </div>
                        </div>
                    </div>

                    {/* Video List (Scrollable) */}
                    <div ref={listRef} className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {playlist.videos.map((video, idx) => (
                            <div
                                key={video.videoId}
                                ref={(el) => (itemRefs.current[idx] = el)}
                                className={clsx(
                                    "group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:bg-white/5",
                                    activeVideoId === video.videoId ? "bg-white/10 border-primary/50" : "bg-transparent border-transparent",
                                    video.status === 'COMPLETED' && activeVideoId !== video.videoId ? "opacity-60" : "opacity-100"
                                )}
                                onClick={() => setActiveVideoId(video.videoId)}
                            >
                                <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                                    <img src={video.thumbnail} className="w-full h-full object-cover" />
                                    {activeVideoId === video.videoId && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Play size={20} className="text-white fill-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={clsx("text-sm font-medium truncate", activeVideoId === video.videoId ? "text-primary" : "text-white")}>
                                        {idx + 1}. {video.title}
                                    </h4>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {Math.floor(video.durationSeconds / 60)}:{(video.durationSeconds % 60).toString().padStart(2, '0')}
                                    </p>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(video.videoId, video.status);
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    title={video.status === 'COMPLETED' ? "Mark as Incomplete" : "Mark as Complete"}
                                >
                                    {video.status === 'COMPLETED' ? (
                                        <CheckCircle className="text-green-500" size={20} />
                                    ) : (
                                        <Circle className="text-zinc-600 group-hover:text-zinc-400" size={20} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaylistDetail;
