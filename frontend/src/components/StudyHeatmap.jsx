import { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { subDays, format, getYear } from 'date-fns';
import { clsx } from 'clsx';
import { Flame } from 'lucide-react';

const StudyHeatmap = ({ playlistId = null }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Pass playlistId if it exists
                const params = playlistId ? { playlistId } : {};
                const res = await api.get('/api/progress/heatmap', { params });
                setData(res.data);
            } catch (error) {
                console.error('Failed to fetch heatmap', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [playlistId]);

    const { streak, contributions } = useMemo(() => {
        const today = new Date();
        const map = {};
        data.forEach(d => map[d.date] = d.count);

        // Calculate Streak
        let currentStreak = 0;
        let dateToCheck = today;

        // Allow streak to continue if today is not done but yesterday was
        if (!map[format(today, 'yyyy-MM-dd')]) {
            if (map[format(subDays(today, 1), 'yyyy-MM-dd')]) {
                dateToCheck = subDays(today, 1);
            } else {
                dateToCheck = null;
            }
        }

        if (dateToCheck) {
            while (true) {
                const dateStr = format(dateToCheck, 'yyyy-MM-dd');
                if (map[dateStr]) {
                    currentStreak++;
                    dateToCheck = subDays(dateToCheck, 1);
                } else {
                    break;
                }
            }
        }

        return { streak: currentStreak, contributions: map };
    }, [data]);

    // Generate Full Calendar Year (Jan 1 - Dec 31)
    const days = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const start = new Date(year, 0, 1); // Jan 1st
        const end = new Date(year, 11, 31); // Dec 31st

        const daysArr = [];
        let current = start;

        while (current <= end) {
            const dateStr = format(current, 'yyyy-MM-dd');
            daysArr.push({
                date: dateStr,
                count: contributions[dateStr] || 0,
                month: format(current, 'MMM'),
                dayOfWeek: current.getDay() // 0 = Sun, 1 = Mon...
            });
            // Add 1 day
            current = new Date(current.setDate(current.getDate() + 1));
        }
        return daysArr;
    }, [contributions]);

    const getColor = (count, dateStr) => {
        const isFuture = new Date(dateStr) > new Date();
        if (isFuture) return 'bg-white/5 opacity-50 cursor-default'; // Dim future dates

        if (count === 0) return 'bg-white/5';
        if (count === 1) return 'bg-primary/40';
        if (count <= 3) return 'bg-primary/70';
        return 'bg-primary';
    };

    if (loading) return <div className="h-10 w-32 bg-surface rounded-full animate-pulse"></div>;

    // Minimalist Streak Badge (No Grid)
    return (
        <div className={clsx("flex items-center gap-2 px-4 py-2 rounded-full border w-fit",
            streak > 0 ? "bg-orange-500/10 border-orange-500/20 text-orange-500" : "bg-white/5 border-white/10 text-zinc-500"
        )}>
            <Flame size={20} className={streak > 0 ? "fill-orange-500 animate-pulse" : ""} />
            <span className="font-bold">{streak} Day Streak</span>
        </div>
    );
};

export default StudyHeatmap;
