import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomDatePicker({ id, value, onChange, disabled, required, placeholder = 'Select date', placement = 'auto' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });
    const containerRef = useRef(null);

    // Calculate position for popover relative to input wrapper
    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const popoverHeight = 330; // height of the popover block
            const spaceBelow = window.innerHeight - rect.bottom;
            
            // Determine direction
            let openUp = false;
            if (placement === 'top') {
                openUp = true;
            } else if (placement === 'bottom') {
                openUp = false;
            } else {
                openUp = spaceBelow < popoverHeight && rect.top > popoverHeight;
            }

            console.log('[DatePicker] updateCoords:', { rect, spaceBelow, openUp, placement });

            setCoords({
                top: openUp 
                    ? rect.top - popoverHeight - 6 
                    : rect.bottom + 6,
                left: rect.left,
                openUpward: openUp
            });
        } else {
            console.log('[DatePicker] updateCoords failed: containerRef.current is null');
        }
    };

    const handleToggleOpen = () => {
        console.log('[DatePicker] handleToggleOpen clicked. Current isOpen:', isOpen, 'disabled:', disabled);
        if (disabled) return;
        if (!isOpen) {
            updateCoords();
        }
        setIsOpen(!isOpen);
    };

    // Update coordinates dynamically on scroll or resize when calendar is open
    useEffect(() => {
        if (!isOpen) return;

        const handleScrollOrResize = () => {
            updateCoords();
        };

        // Capture scroll in modal body or any other scrolling element
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [isOpen]);

    // Initialize calendar view to the current value, or today if no value
    const parseValueDate = (val) => {
        if (!val) return new Date();
        const parts = val.split('-');
        if (parts.length === 3) {
            const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            if (!isNaN(date.getTime())) return date;
        }
        return new Date();
    };

    const [viewDate, setViewDate] = useState(() => parseValueDate(value));

    // Update calendar view when value updates from outside
    useEffect(() => {
        if (value) {
            setViewDate(parseValueDate(value));
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                // If clicked popover, do not close (since it is rendered outside container in portal)
                const popover = document.querySelector('.datepicker-calendar-popover');
                if (popover && popover.contains(event.target)) {
                    console.log('[DatePicker] handleClickOutside: clicked inside popover, ignore.');
                    return;
                }
                console.log('[DatePicker] handleClickOutside: clicked outside. Closing datepicker.');
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewYear, viewMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewYear, viewMonth + 1, 1));
    };

    const handleSelectDay = (day) => {
        if (disabled) return;
        const selectedMonth = String(viewMonth + 1).padStart(2, '0');
        const selectedDay = String(day).padStart(2, '0');
        const formatted = `${viewYear}-${selectedMonth}-${selectedDay}`;
        onChange(formatted);
        setIsOpen(false);
    };

    const handleClear = () => {
        if (disabled) return;
        onChange('');
        setIsOpen(false);
    };

    // Calculate days grid
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const totalDays = getDaysInMonth(viewYear, viewMonth);
    const startOffset = getFirstDayOfMonth(viewYear, viewMonth);

    const days = [];
    // Padding for empty spots before the 1st of the month
    for (let i = 0; i < startOffset; i++) {
        days.push(null);
    }
    // Days in current month
    for (let i = 1; i <= totalDays; i++) {
        days.push(i);
    }

    // Format display date for input box
    const getDisplayString = () => {
        if (!value) return '';
        const parts = value.split('-');
        if (parts.length === 3) {
            const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            }
        }
        return value;
    };

    // Check if a day matches the currently selected value
    const isSelected = (day) => {
        if (!value || !day) return false;
        const parts = value.split('-');
        if (parts.length === 3) {
            return (
                parseInt(parts[0], 10) === viewYear &&
                parseInt(parts[1], 10) === (viewMonth + 1) &&
                parseInt(parts[2], 10) === day
            );
        }
        return false;
    };

    // Check if a day is today
    const isToday = (day) => {
        if (!day) return false;
        const now = new Date();
        return (
            now.getFullYear() === viewYear &&
            now.getMonth() === viewMonth &&
            now.getDate() === day
        );
    };

    return (
        <div ref={containerRef} className={`custom-datepicker-container ${disabled ? 'disabled' : ''}`}>
            <div
                className={`datepicker-input-wrapper ${isOpen ? 'focused' : ''}`}
                onClick={handleToggleOpen}
            >
                <input
                    id={id}
                    type="text"
                    readOnly
                    placeholder={placeholder}
                    value={getDisplayString()}
                    disabled={disabled}
                    required={required}
                />
                <CalendarIcon className="datepicker-calendar-icon" size={16} />
            </div>

            {isOpen && createPortal(
                <div 
                    className={`datepicker-calendar-popover ${coords.openUpward ? 'open-upward' : ''}`}
                    style={{
                        position: 'fixed',
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                        width: '290px',
                        zIndex: 9999999
                    }}
                >
                    {/* Header */}
                    <div className="datepicker-popover-header">
                        <button type="button" className="nav-btn" onClick={handlePrevMonth}>
                            <ChevronLeft size={16} />
                        </button>
                        <span className="current-month-year">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button type="button" className="nav-btn" onClick={handleNextMonth}>
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="datepicker-weekdays-grid">
                        {WEEKDAYS.map((day) => (
                            <div key={day} className="weekday-name">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="datepicker-days-grid">
                        {days.map((day, idx) => {
                            if (day === null) {
                                return <div key={`empty-${idx}`} className="day-cell empty" />;
                            }
                            return (
                                <div
                                    key={`day-${day}`}
                                    className={`day-cell ${isSelected(day) ? 'selected' : ''} ${isToday(day) ? 'today' : ''}`}
                                    onClick={() => handleSelectDay(day)}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="datepicker-popover-footer">
                        <button type="button" className="clear-btn" onClick={handleClear}>
                            Clear
                        </button>
                        <button
                            type="button"
                            className="today-btn"
                            onClick={() => {
                                const now = new Date();
                                const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
                                const currentDay = String(now.getDate()).padStart(2, '0');
                                onChange(`${now.getFullYear()}-${currentMonth}-${currentDay}`);
                                setIsOpen(false);
                            }}
                        >
                            Today
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
