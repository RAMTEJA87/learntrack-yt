import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import { useProgress } from "../contexts/ProgressContext";

const PlaylistPage = () => {
  const { id } = useParams();
  const { getProgress, markProgress } = useProgress();
  const [pl, setPl] = useState(null);
  const [index, setIndex] = useState(null); // start as null until computed
  const listRef = useRef(null);
  const itemRefs = useRef({});

  const findFirstUncompleted = (playlistLength) => {
    const prog = getProgress(id) || {};
    const vids = prog.videos || [];
    for (let i = 0; i < playlistLength; i++) {
      if (!vids[i] || !vids[i].completed) return i;
    }
    // all completed -> start at last item (or 0). Here pick last + 1 fallback to 0
    return playlistLength > 0 ? playlistLength - 1 : 0;
  };

  useEffect(() => {
    const fetch = async () => {
      const { data } = await api.get(`/api/playlists/${id}`);
      setPl(data);
      itemRefs.current = {};

      // try to compute index immediately, but if progress may still be loading
      // retry a few times (short delays) to allow ProgressContext to populate
      const maxRetries = 8;
      let next = findFirstUncompleted(data.videos?.length || 0);
      if (next === 0) {
        // only retry if progress appears empty/partial (avoid unnecessary waits)
        for (let i = 0; i < maxRetries; i++) {
          // if a later tick of the context populates progress, findFirstUncompleted will change
          const pNext = findFirstUncompleted(data.videos?.length || 0);
          if (pNext !== next) {
            next = pNext;
            break;
          }
          // small delay to allow context/async load
          // eslint-disable-next-line no-await-in-loop
          await new Promise((res) => setTimeout(res, 120));
        }
      }
      setIndex(next);
    };
    fetch();
    // eslint-disable-next-line
  }, [id]);

  // scroll current item into view whenever playlist / index changes
  useEffect(() => {
    if (!pl || index === null) return;
    const el = itemRefs.current[index];
    if (el && listRef.current) {
      const doScroll = () => {
        try {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch {
          listRef.current.scrollTop = el.offsetTop;
        }
        listRef.current.scrollTop = el.offsetTop;
      };
      // try to wait for refs to be attached
      if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(() => {
          // if ref isn't ready yet, give one micro-delay
          if (!itemRefs.current[index]) setTimeout(doScroll, 50);
          else doScroll();
        });
      } else {
        setTimeout(doScroll, 50);
      }
    } else {
      // if ref not found yet, retry shortly
      const t = setTimeout(() => {
        if (itemRefs.current[index] && listRef.current) {
          try {
            itemRefs.current[index].scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
            listRef.current.scrollTop = itemRefs.current[index].offsetTop;
          } catch {}
        }
      }, 80);
      return () => clearTimeout(t);
    }
  }, [index, pl]);

  if (!pl || index === null) return <div>Loading...</div>;

  const video = pl.videos?.[index];
  const prog = getProgress(id).videos?.[index] || {};
  const start = Math.max(0, Math.floor(prog.seconds || 0));
  const src = video?.videoId
    ? `https://www.youtube.com/embed/${video.videoId}?start=${start}&autoplay=1&rel=0`
    : null;

  const markDone = () => {
    markProgress(id, index, {
      seconds: 0,
      completed: true,
      title: video?.title,
    });
    // compute next uncompleted index after marking done
    const next = findFirstUncompleted(pl.videos?.length || 0);
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
        <ul ref={listRef} className="mt-2 space-y-2 max-h-96 overflow-y-auto">
          {pl.videos?.map((v, i) => (
            <li
              key={v.videoId || i}
              ref={(el) => (itemRefs.current[i] = el)}
              className={`p-2 ${i === index ? "font-bold" : ""}`}
            >
              <button
                className="text-left w-full text-left"
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
