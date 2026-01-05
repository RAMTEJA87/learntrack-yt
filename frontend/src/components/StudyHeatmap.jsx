import React, { useState, useEffect, useRef } from "react";
import { Flame } from "lucide-react";

import api from "../utils/api";

const StudyHeatmap = ({ days = 30, playlistId = null }) => {
  const [activityMap, setActivityMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const url = playlistId
          ? `/api/progress/heatmap?playlistId=${playlistId}`
          : '/api/progress/heatmap';

        const { data } = await api.get(url);

        // Convert array [{date, count}] to map {date: count}
        const map = {};
        data.forEach(item => {
          map[item.date] = item.count;
        });
        setActivityMap(map);
      } catch (error) {
        console.error("Failed to fetch heatmap", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, [playlistId]);

  // Helper
  const formatDate = (d) => d.toISOString().slice(0, 10);
  const bgFromNorm = (norm) => {
    const hue = 140;
    const sat = 60;
    const light = Math.round(88 - norm * 50);
    return `hsl(${hue} ${sat}% ${light}%)`;
  };
  const DAY_MS = 24 * 60 * 60 * 1000;

  // build dates oldest -> newest
  const today = new Date();
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    const key = formatDate(d);
    dates.push({ date: d, key, count: activityMap[key] || 0 });
  }

  const maxCount = Math.max(1, ...dates.map((d) => d.count));
  // compute streak (consecutive days ending today with activity)
  let streak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    // If today has 0, streak is 0? Or should we check yesterday?
    // Let's assume strict streak (needs activity today or yesterday if today not over)
    if (dates[i].count > 0) streak++;
    else if (i === dates.length - 1 && dates[i].count === 0) continue; // Allow 0 for today if just started
    else break;
  }

  const breakIdx = streak > 0 ? dates.length - 1 - streak : -1;

  if (loading) return <div className="animate-pulse h-10 w-40 bg-white/5 rounded-full" />;

  const hasAny = Object.values(activityMap).some((v) => v > 0);

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "8px 12px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.06)",
          alignItems: "center",
          background:
            streak > 0 ? "rgba(255,140,60,0.06)" : "rgba(255,255,255,0.02)",
        }}
      >
        <Flame style={{ color: streak > 0 ? "#fb923c" : "#94a3b8" }} />
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontWeight: 700 }}>{streak}d streak</div>
          <div style={{ fontSize: 12, color: "rgba(148,163,184,1)" }}>
            Last {days} days
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          aria-hidden
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 22px)",
            gap: 6,
          }}
        >
          {dates.map((d, idx) => {
            const active = d.count > 0;
            const isBreak = idx === breakIdx && !active && streak > 0;
            const norm = Math.min(1, d.count / maxCount);
            const bg = active ? bgFromNorm(norm) : "rgba(255,255,255,0.03)";
            return (
              <div
                key={d.key}
                title={`${d.key} • ${d.count} item(s)`}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isBreak ? 14 : 11,
                  transform: "translateZ(0)",
                  transition: "transform .12s ease, box-shadow .12s ease",
                  cursor: "default",
                  background: bg,
                  color: norm > 0.6 ? "#fff" : "rgba(255,255,255,0.75)",
                  border: isBreak
                    ? "2px solid rgba(255,80,80,0.95)"
                    : "1px solid rgba(255,255,255,0.03)",
                  boxShadow: isBreak
                    ? "0 4px 10px rgba(255,80,80,0.12)"
                    : undefined,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {isBreak ? "😭" : d.count > 0 ? d.count : ""}
              </div>
            );
          })}
        </div>

        {!hasAny ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ color: "rgba(148,163,184,1)", fontSize: 13 }}>
              No activity yet — watch some videos!
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StudyHeatmap;
