import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import StudyHeatmap from '../components/StudyHeatmap';
import { Plus, PlayCircle, Clock } from 'lucide-react';

const Dashboard = () => {
    const [playlists, setPlaylists] = useState([]);
    const [newUrl, setNewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const fetchPlaylists = async () => {
        try {
            const { data } = await api.get('/playlists');
            setPlaylists(data);
        } catch (error) {
            console.error(error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const handleAddPlaylist = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/playlists', { url: newUrl });
            setNewUrl('');
            fetchPlaylists();
        } catch (error) {
            alert('Error adding playlist: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold">My Learning Paths</h2>
                    <p className="text-zinc-400">Track and manage your video courses</p>
                </div>
                <StudyHeatmap />
            </header>

            {/* Add Playlist Form */}
            <form onSubmit={handleAddPlaylist} className="bg-surface p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4 items-center">
                <input
                    type="text"
                    placeholder="Paste YouTube Playlist URL (or use 'demo-java' for sample)"
                    className="flex-1 w-full bg-background border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-colors"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-primary hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? 'Importing...' : <><Plus size={20} /> Import Playlist</>}
                </button>
            </form>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((pl) => (
                    <Link to={`/playlist/${pl._id}`} key={pl._id} className="group cursor-pointer">
                        <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden card-hover h-full flex flex-col">
                            {/* Generic Thumbnail fallback if image fails or missing */}
                            <div className="relative h-40 bg-zinc-800 overflow-hidden">
                                {pl.thumbnail ? (
                                    <img src={pl.thumbnail} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-600">
                                        <PlayCircle size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60"></div>
                                <div className="absolute bottom-2 left-4 right-4">
                                    <h3 className="font-bold text-lg truncate drop-shadow-md">{pl.title}</h3>
                                    <p className="text-xs text-zinc-300 drop-shadow-md">{pl.channelTitle}</p>
                                </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm text-zinc-400">
                                        <span>{pl.completedCount} / {pl.videoCount} Videos</span>
                                        <span>{pl.percent}%</span>
                                    </div>
                                    <ProgressBar progress={pl.percent} />
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-zinc-500">
                                    <Clock size={14} />
                                    <span>Total Duration: {Math.floor(pl.totalDurationSeconds / 3600)}h {Math.floor((pl.totalDurationSeconds % 3600) / 60)}m</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {!fetching && playlists.length === 0 && (
                <div className="text-center py-20 bg-surface/30 rounded-2xl border border-white/5 border-dashed">
                    <p className="text-zinc-500">No playlists found. Import one to get started!</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
