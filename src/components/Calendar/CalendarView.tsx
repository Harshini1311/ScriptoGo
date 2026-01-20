import React, { useMemo } from "react";
import DayCard from "./DayCard";

interface CalendarViewProps {
    days: number;
    scripts: any[];
    onSelectDay: (script: any) => void;
}

const CalendarView = React.memo(({ days, scripts, onSelectDay }: CalendarViewProps) => {
    const startDate = new Date();

    // Generate array of dates
    const calendarDays = Array.from({ length: days }).map((_, i) => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        return d;
    });

    // Helper to find script for a date
    const getScriptForDate = (date: Date) => {
        return scripts.find(s => {
            const scheduledDate = new Date(s.scheduled_date);
            return scheduledDate.toDateString() === date.toDateString();
        });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {calendarDays.map((date, idx) => (
                <DayCard
                    key={idx}
                    date={date}
                    script={getScriptForDate(date)}
                    onClick={() => {
                        const script = getScriptForDate(date);
                        if (script) onSelectDay(script);
                    }}
                />
            ))}
        </div>
    );
});


CalendarView.displayName = "CalendarView";

export default CalendarView;


