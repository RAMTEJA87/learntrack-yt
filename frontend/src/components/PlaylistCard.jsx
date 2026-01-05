import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PlaylistCard({ playlist, onAddToQueue, onSave }) {
  const navigate = useNavigate();

  const styles = {
    card: { borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', background: '#fff', cursor: 'pointer' },
    thumb: { width: '100%', height: 160, objectFit: 'cover', display: 'block' },
    body: { padding: 12 },
    title: { fontSize: 14, fontWeight: 600, marginBottom: 6 },
    meta: { fontSize: 12, color: '#666' },
    actions: { marginTop: 8, display: 'flex', gap: 8 },
    btn: { padding: '6px 8px', borderRadius: 6, border: '1px solid #eee', background: '#fafafa', cursor: 'pointer', fontSize: 12 }
  };

  return (
    <div style={styles.card}>
      <img src={playlist.thumbnail} alt={playlist.title} style={styles.thumb} onClick={() => navigate(`/playlist/${playlist._id}`)} />
      <div style={styles.body}>
        <div style={styles.title} onClick={() => navigate(`/playlist/${playlist._id}`)}>{playlist.title}</div>
        <div style={styles.meta}>{playlist.videos?.length || 0} videos • {playlist.visibility || 'private'}</div>
        <div style={styles.actions}>
          <button style={styles.btn} onClick={() => onAddToQueue && onAddToQueue(playlist)}>Add to Queue</button>
          <button style={styles.btn} onClick={() => onSave && onSave(playlist)}>Save</button>
        </div>
      </div>
    </div>
  );
}