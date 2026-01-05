import React, { useState, useEffect } from 'react';

export default function MiniPlayer({ video, isPlayingProp = false, onClose, onNext, onPrev, onTogglePlay }) {
  const [isPlaying, setIsPlaying] = useState(isPlayingProp);
  useEffect(() => setIsPlaying(isPlayingProp), [isPlayingProp]);

  if (!video) return null;

  const styles = {
    container: { position: 'fixed', right: 16, bottom: 16, width: 340, maxWidth: 'calc(100% - 32px)', background: '#111', color: '#fff', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.3)', display: 'flex', gap: 12, padding: 12, alignItems: 'center', zIndex: 1000 },
    thumb: { width: 120, height: 68, objectFit: 'cover', borderRadius: 6 },
    info: { flex: 1, overflow: 'hidden' },
    title: { fontSize: 14, fontWeight: 600, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    channel: { fontSize: 12, color: '#bbb' },
    controls: { display: 'flex', gap: 8, marginTop: 8 },
    btn: { background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' },
  };

  const handleToggle = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    onTogglePlay && onTogglePlay(next);
  };

  return (
    <div style={styles.container}>
      <img src={video.thumbnail} alt={video.title} style={styles.thumb} />
      <div style={styles.info}>
        <div style={styles.title}>{video.title}</div>
        <div style={styles.channel}>{video.channel}</div>
        <div style={styles.controls}>
          <button style={styles.btn} onClick={onPrev} aria-label="Previous">⏮️</button>
          <button style={styles.btn} onClick={handleToggle} aria-label="Play/Pause">{isPlaying ? '⏸️' : '▶️'}</button>
          <button style={styles.btn} onClick={onNext} aria-label="Next">⏭️</button>
          <button style={styles.btn} onClick={onClose} aria-label="Close">✖️</button>
        </div>
      </div>
    </div>
  );
}