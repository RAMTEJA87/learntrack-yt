import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Save, Loader } from 'lucide-react';

const NotesSection = ({ playlistId, videoId }) => {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        if (!playlistId || !videoId) return;

        const fetchNote = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/api/notes/${playlistId}/${videoId}`);
                setNote(data.content || '');
            } catch (error) {
                console.error("Failed to fetch note", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNote();
    }, [playlistId, videoId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/api/notes', { playlistId, videoId, content: note });
            setLastSaved(new Date());
        } catch (error) {
            alert('Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-surface p-6 rounded-2xl border border-white/5 mt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">My Notes</h3>
                {lastSaved && (
                    <span className="text-xs text-zinc-500">
                        Saved {lastSaved.toLocaleTimeString()}
                    </span>
                )}
            </div>

            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 bg-surface/50 flex items-center justify-center z-10">
                        <Loader className="animate-spin text-primary" />
                    </div>
                )}
                <textarea
                    className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:outline-none focus:border-primary/50 min-h-[200px] resize-y font-mono text-sm leading-relaxed"
                    placeholder="Write your key takeaways here..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>

            <div className="flex justify-end mt-4">
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Note'}
                </button>
            </div>
        </div>
    );
};

export default NotesSection;
