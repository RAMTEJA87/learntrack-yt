import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import { useProgress } from "../contexts/ProgressContext";

const PlaylistPage = () => {
  const { id } = useParams();
  const { getProgress, markProgress, getNextVideoIndex } = useProgress();
  const [pl, setPl] = useState(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await api.get(`/api/playlists/${id}`);
      setPl(data);
      const next = getNextVideoIndex(id, data.videos?.length || 0);
      setIndex(next);
    };
    fetch();
    // eslint-disable-next-line
  }, [id]);

  if (!pl) return <div>Loading...</div>;

  const video = pl.videos?.[index];
  const prog = getProgress(id).videos?.[index] || {};
  const start = Math.max(0, Math.floor(prog.seconds || 0));
  // build youtube embed src if video has videoId
  const src = video?.videoId
    ? `https://www.youtube.com/embed/${video.videoId}?start=${start}&autoplay=1&rel=0`
    : null;

  const markDone = () => {
    markProgress(id, index, {
      seconds: 0,
      completed: true,
      title: video?.title,
    });
    // move to next
    const next = Math.min((pl.videos?.length || 1) - 1, index + 1);
    setIndex(next);
  };

  const savePosition = (secs) => {
    markProgress(id, index, { seconds: Math.floor(secs), title: video?.title });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{pl.title}</h2>
        <Link to="/">Back</Link>
      </div>

      <div className="bg-surface rounded p-4">
        {src ? (
          <div className="aspect-video">
            <iframe
              title={video?.title}
              className="w-full h-full"
              src={src}
              allow="autoplay; encrypted-media"
            />
          </div>
        ) : (
          <div className="p-8">No video embed available</div>
        )}

        <div className="mt-4 flex gap-2">
          <button className="btn" onClick={markDone}>
            Mark Completed
          </button>
          <button
            className="btn"
            onClick={() => {
              // quick save current start (example: 30s) — in a real player you'd read current time
              savePosition(start + 30);
              alert("Saved position (+30s) for demo");
            }}
          >
            Save position (+30s)
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold">Up next</h3>
        <ul className="mt-2 space-y-2">
          {pl.videos?.map((v, i) => (
            <li key={v.videoId} className={i === index ? "font-bold" : ""}>
              <button
                className="text-left"
                onClick={() => {
                  setIndex(i);
                }}
              >
                {i + 1}. {v.title} {i === index ? " (current)" : ""}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlaylistPage;
