import React, { createContext, useContext, useEffect, useState } from "react";

const KEY = "lt_progress_v1";
const ProgressContext = createContext(null);

export const useProgress = () => useContext(ProgressContext);

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
function writeStore(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export const ProgressProvider = ({ children }) => {
  const [store, setStore] = useState(readStore());

  useEffect(() => {
    writeStore(store);
  }, [store]);

  const getProgress = (playlistId) => store[playlistId] || { videos: {} };

  const markProgress = (
    playlistId,
    videoIndex,
    { seconds = 0, completed = false, title = null } = {}
  ) => {
    setStore((prev) => {
      const copy = { ...prev };
      copy[playlistId] = copy[playlistId] || { videos: {} };
      const vid = copy[playlistId].videos[videoIndex] || {};
      if (title) vid.title = title;
      if (seconds !== undefined) vid.seconds = seconds;
      if (completed) {
        vid.completed = true;
        vid.watchedAt = new Date().toISOString();
      }
      copy[playlistId].videos[videoIndex] = vid;
      return copy;
    });
  };

  const getNextVideoIndex = (playlistId, totalVideos = 0) => {
    const p = getProgress(playlistId).videos || {};
    for (let i = 0; i < totalVideos; i++) {
      if (!p[i] || !p[i].completed) return i;
    }
    return Math.max(0, totalVideos - 1);
  };

  const activityByDate = () => {
    // aggregate completed videos by yyyy-mm-dd
    const map = {};
    Object.values(store).forEach((pl) => {
      Object.values(pl.videos || {}).forEach((v) => {
        if (v.watchedAt) {
          const d = v.watchedAt.slice(0, 10);
          map[d] = map[d] || [];
          map[d].push({ title: v.title || "video", seconds: v.seconds || 0 });
        }
      });
    });
    return map;
  };

  return (
    <ProgressContext.Provider
      value={{
        store,
        getProgress,
        markProgress,
        getNextVideoIndex,
        activityByDate,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export default ProgressContext;
