import React from "react";
import { useProgress } from "../contexts/ProgressContext";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  const { activityByDate } = useProgress();
  const activity = activityByDate();
  const dates = Object.keys(activity).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Study Timeline</h2>
        <Link to="/">Back</Link>
      </div>

      {dates.length === 0 && (
        <div>No activity yet — start a playlist to record progress.</div>
      )}

      {dates.map((d) => (
        <div key={d} className="bg-surface rounded p-4">
          <div className="text-sm text-zinc-400">{d}</div>
          <ul className="mt-2 list-disc list-inside">
            {activity[d].map((a, i) => (
              <li key={i}>
                {a.title} {a.seconds ? `(${Math.floor(a.seconds)}s)` : ""}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default UserDashboard;
