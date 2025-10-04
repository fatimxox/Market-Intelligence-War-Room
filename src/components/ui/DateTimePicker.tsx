import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ArrowLeft, ChevronRight } from '../icons.tsx';
import Button from './Button.tsx';

const formatDateTime = (date: Date | null): string => {
  if (!date) return 'Pick a date and time';
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strHours = hours.toString().padStart(2, '0');
  
  return `${month}/${day}/${year} ${strHours}:${minutes} ${ampm}`;
};

interface DateTimePickerProps {
    label: string;
    selected: Date | null;
    onChange: (date: Date | null) => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ label, selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(selected || new Date());
    const [time, setTime] = useState(() => {
        const d = selected || new Date();
        const h = d.getHours();
        return {
            hour: h % 12 || 12,
            minute: d.getMinutes(),
            period: (h >= 12 ? 'PM' : 'AM') as 'AM' | 'PM',
        };
    });

    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selected) {
            const h = selected.getHours();
            setTime({
                hour: h % 12 || 12,
                minute: selected.getMinutes(),
                period: (h >= 12 ? 'PM' : 'AM'),
            });
            setViewDate(selected);
        }
    }, [selected]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDateSelect = (date: Date) => {
        let hour = time.hour;
        if (time.period === 'PM' && hour < 12) hour += 12;
        if (time.period === 'AM' && hour === 12) hour = 0;
        date.setHours(hour, time.minute, 0, 0);
        onChange(date);
    };
    
    const handleTimeSelect = (newTime: { hour: number; minute: number; period: 'AM' | 'PM'}) => {
        setTime(newTime);
        const dateBase = selected || viewDate;
        const newDate = new Date(dateBase);
        let hour = newTime.hour;
        if (newTime.period === 'PM' && hour < 12) hour += 12;
        if (newTime.period === 'AM' && hour === 12) hour = 0;
        newDate.setHours(hour, newTime.minute, 0, 0);
        onChange(newDate);
    };

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
    
    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const days = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const weeks: (number | null)[][] = [];
        let week: (number | null)[] = Array(startDay).fill(null);

        for (let day = 1; day <= days; day++) {
            week.push(day);
            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        }
        if (week.length > 0) {
            week = [...week, ...Array(7-week.length).fill(null)];
            weeks.push(week);
        }

        return (
            <div>
                <div className="flex justify-between items-center mb-2">
                    <Button type="button" variant="ghost" size="icon" onClick={() => setViewDate(new Date(year, month - 1, 1))}><ArrowLeft className="w-4 h-4" /></Button>
                    <span className="font-semibold">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setViewDate(new Date(year, month + 1, 1))}><ChevronRight className="w-4 h-4" /></Button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {weeks.flat().map((day, i) => (
                        <button 
                            type="button"
                            key={i}
                            disabled={!day}
                            onClick={() => day && handleDateSelect(new Date(year, month, day))}
                            className={`w-8 h-8 rounded-md text-sm transition-colors ${!day ? 'cursor-default' : 'hover:bg-accent hover:text-background'}
                            ${selected && day === selected.getDate() && month === selected.getMonth() && year === selected.getFullYear() ? 'bg-accent text-background font-bold' : ''}
                            `}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    
    const renderTimePicker = () => {
        const hours = Array.from({ length: 12 }, (_, i) => i + 1);
        const minutes = Array.from({ length: 60 }, (_, i) => i);
    
        const selectClasses = "w-full bg-secondary border border-panel-border rounded-md py-1 px-2 text-primary-text focus:outline-none focus:ring-1 focus:ring-accent";
    
        return (
             <div className="space-y-3">
                 <div>
                    <label className="text-xs text-gray-400" htmlFor="dt-hour">Hour</label>
                    <select
                        id="dt-hour"
                        value={time.hour}
                        onChange={(e) => handleTimeSelect({ ...time, hour: parseInt(e.target.value) })}
                        className={selectClasses}
                    >
                        {hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-400" htmlFor="dt-minute">Minute</label>
                    <select
                        id="dt-minute"
                        value={time.minute}
                        onChange={(e) => handleTimeSelect({ ...time, minute: parseInt(e.target.value) })}
                        className={selectClasses}
                    >
                        {minutes.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Period</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => handleTimeSelect({ ...time, period: 'AM' })}
                            className={`px-3 py-1.5 text-sm rounded-md ${time.period === 'AM' ? 'bg-accent text-background font-bold' : 'bg-secondary hover:bg-secondary-hover'}`}
                        >
                            AM
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTimeSelect({ ...time, period: 'PM' })}
                            className={`px-3 py-1.5 text-sm rounded-md ${time.period === 'PM' ? 'bg-accent text-background font-bold' : 'bg-secondary hover:bg-secondary-hover'}`}
                        >
                            PM
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    
    return (
        <div className="w-full relative" ref={pickerRef}>
            <label htmlFor="datetime" className="block text-sm font-medium text-primary-text mb-1">{label}</label>
            <button
                type="button"
                id="datetime"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-secondary border border-panel-border rounded-md py-2 px-3 text-left text-primary-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition flex items-center gap-2"
            >
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{formatDateTime(selected)}</span>
            </button>
            {isOpen && (
                <div className="absolute z-10 top-full mt-2 bg-panel border border-panel-border rounded-lg shadow-lg p-4 w-auto flex gap-4">
                    {renderCalendar()}
                    <div className="border-l border-panel-border pl-4 w-40">
                        {renderTimePicker()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateTimePicker;