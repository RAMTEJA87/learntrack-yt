import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home } from 'lucide-react';
import MiniPlayer from './MiniPlayer';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [miniVideo, setMiniVideo] = useState(null);

    useEffect(() => {
        window.showMiniPlayer = (video) => setMiniVideo(video);
        return () => { try { delete window.showMiniPlayer; } catch (e) {} };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background text-white pb-20 md:pb-0">
            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-white/5 z-50 flex items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-lg">
                        L
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden md:block">LearnTrackYT</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-400 hidden sm:block">Hello, {user?.username}</span>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} className="text-zinc-400 hover:text-white" />
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
                {children}
            </main>

            {/* Mobile Bottom Nav (Optional but good for mobile-first) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-white/5 flex items-center justify-around z-40">
                <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-primary">
                    <Home size={24} />
                    <span className="text-xs">Home</span>
                </button>
                {/* Could add more tabs like 'Profile' or 'Search' */}
            </div>

            <MiniPlayer
                video={miniVideo}
                onClose={() => setMiniVideo(null)}
                onNext={() => {}}
                onPrev={() => {}}
                onTogglePlay={() => {}}
            />
        </div>
    );
};

export default Layout;
