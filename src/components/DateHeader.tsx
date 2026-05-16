import React, { useState, useMemo } from 'react';

interface DateHeaderProps {
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
}

export const DateHeader: React.FC<DateHeaderProps> = ({ onDateRangeChange }) => {
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    now.setDate(now.getDate() + diff);
    return now;
  });

  const dateRange = useMemo(() => {
    const dates: Date[] = [];
    const current = new Date(startDate);
    for (let i = 0; i < 14; i++) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [startDate]);

  const monthYear = useMemo(() => {
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const year = startDate.getFullYear();
    const month = months[startDate.getMonth()];
    return `${year}年${month}`;
  }, [startDate]);

  const handlePrev = () => {
    const newStart = new Date(startDate);
    newStart.setDate(newStart.getDate() - 14);
    setStartDate(newStart);
    if (onDateRangeChange) {
      const endDate = new Date(newStart);
      endDate.setDate(endDate.getDate() + 13);
      onDateRangeChange(newStart, endDate);
    }
  };

  const handleNext = () => {
    const newStart = new Date(startDate);
    newStart.setDate(newStart.getDate() + 14);
    setStartDate(newStart);
    if (onDateRangeChange) {
      const endDate = new Date(newStart);
      endDate.setDate(endDate.getDate() + 13);
      onDateRangeChange(newStart, endDate);
    }
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    today.setDate(today.getDate() + diff);
    setStartDate(today);
    if (onDateRangeChange) {
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 13);
      onDateRangeChange(today, endDate);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  const getDayLabel = (date: Date) => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return days[date.getDay()];
  };

  return (
    <div className="flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3">
      <div className="flex items-center space-x-4">
        <button
          onClick={handlePrev}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="上14天"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center space-x-3">
          <div className="text-lg font-semibold text-slate-800">{monthYear}</div>
          <button
            onClick={handleToday}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            今天
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="下14天"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex items-center space-x-1">
        {dateRange.map((date, index) => (
          <div
            key={index}
            className={`flex flex-col items-center min-w-[50px] py-2 px-1 rounded-lg cursor-pointer transition-colors ${
              isToday(date)
                ? 'bg-primary-100 text-primary-700'
                : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <span className="text-xs opacity-70">{getDayLabel(date)}</span>
            <span className={`text-sm font-medium ${isToday(date) ? 'font-bold' : ''}`}>
              {date.getDate()}日
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
