import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const ProgressBar = ({ progress, className }) => {
    return (
        <div className={twMerge("w-full bg-zinc-700 rounded-full h-2.5 overflow-hidden", className)}>
            <div
                className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;
