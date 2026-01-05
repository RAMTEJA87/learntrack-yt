import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock } from 'lucide-react';

const JumpBackIn = () => {
    const { user } = useAuth();
    if (!user?.lastActiveVideo) return null;

    const { playlistId, videoId, title, thumbnail } = user.lastActiveVideo;

    return (
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-6 rounded-2xl border border-white/10 mb-8 flex flex-col md:flex-row gap-6 items-center animate-fade-in">
            <div className="relative w-full md:w-64 h-36 rounded-xl overflow-hidden shrink-0 group shadow-lg border border-white/10">
                <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <PlayCircle size={40} className="text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-zinc-300 mb-3 border border-white/5">
                    <Clock size={12} />
                    <span>Jump back in</span>
                </div>
                <h3 className="text-xl font-bold mb-4 line-clamp-2 text-white">{title}</h3>
                <Link
                    to={`/playlist/${playlistId}?videoId=${videoId}`}
                    className="inline-block bg-white text-black font-bold py-3 px-8 rounded-xl hover:bg-zinc-200 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
                >
                    Continue Watching
                </Link>
            </div>
        </div>
    );
};

export default JumpBackIn;
