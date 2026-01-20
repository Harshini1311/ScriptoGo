"use client";

import { Calendar as CalendarIcon, FileText, Layout } from "lucide-react";

interface DayCardProps {
    date: Date;
    script?: {
        platform: string;
        topic: string;
        content: string;
    };
    onClick?: () => void;
}

export default function DayCard({ date, script, onClick }: DayCardProps) {
    const isToday = new Date().toDateString() === date.toDateString();

    return (
        <div
            onClick={onClick}
            className={`min-h-[140px] rounded-md border p-3 transition-all cursor-pointer group ${isToday
                ? "border-primary bg-primary/5 shadow-glow-sm"
                : "border-border hover:border-primary/50 hover:bg-card/50"
                }`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                </span>
                {isToday && (
                    <span className="h-1.5 w-1.5 rounded-md bg-primary animate-pulse" />
                )}
            </div>

            {script ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] uppercase font-bold bg-primary/10 text-primary border border-primary/20">
                            {script.platform}
                        </span>
                    </div>
                    <h4 className="text-xs font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {script.topic || "Untitled"}
                    </h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {typeof script.content === 'string' ? script.content : "Draft content..."}
                    </p>
                </div>
            ) : (
                <div className="flex h-[80px] items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                    <CalendarIcon className="h-6 w-6" />
                </div>
            )}
        </div>
    );
}
