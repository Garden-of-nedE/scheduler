import React, { useState } from 'react'
import { getMonthViewForDate, getMonthGridDates } from '../../utils/calendarUtils.js'
import { formatTime, withOpacity } from '../../utils/formatters.js'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const EVENT_COLOR = '#B03DE1'

export default function CalendarMonthView({ currentDate, setCurrentDate, events, assessments, enrollments }) {
    console.log('Props received:', events, assessments)
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const gridDates = getMonthGridDates(year, month)

    const [hoveredItem, setHoveredItem] = useState(null)
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

    function goToPrevMonth() {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    function goToNextMonth() {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    function handleMouseEnter(item, e) {
        const rect = e.currentTarget.getBoundingClientRect()
        setHoveredItem(item)
        setHoverPosition({ x: rect.lect + rect.width /2, y: rect.top })
    }

    function handleMouseLeave() {
        setHoveredItem(null)
    }

    return (
        <div>
            <div className = "calendar-nav button-group">
                <button className = "btn btn-secondary" onClick = {goToPrevMonth}>
                    Prev
                </button>
                <h3>{MONTH_NAMES[month]} {year}</h3>
                <button className = "btn btn-secondary" onClick = {goToNextMonth}>
                    Next
                </button>
            </div>

            <div className = "month-grid">
                {WEEKDAY_LABELS.map((label) => (
                    <div key = {label} className = "month-weekday-label">{label}</div>
                ))}

                {gridDates.map((date) => {
                    const isCurrentMonth = date.getMonth() === month
                    const items = getMonthViewForDate(date, events, assessments)

                    return (
                        <div key = {date.toISOString()} className = {`month-day-cell ${isCurrentMonth ? '' : 'month-day-outside'}`}>
                            <span className = "month-day-number">{date.getDate()}</span>
                            {items.length > 0 && (
                                <div className = "month-day-indicators">
                                    {items.map((item) => {
                                        const enrollment = item.type === 'assessment' ? enrollments?.find((e) => e.course_code === item.course_code) : null
                                        const chipColor = item.type === 'assessment' ? (enrollment?.color || '#4F6D7A') : EVENT_COLOR

                                        return (
                                            <div 
                                            key = {item.id} 
                                            className = {`month-day-chip month-day-chip${item.type}`}
                                            style = {{ backgroundColor: chipColor }}
                                            onMouseEnter = {(e) => handleMouseEnter(item, e)}
                                            onMouseLeave = {handleMouseLeave}
                                            >
                                                {item.type === 'event' ? item.title : item.task_name}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}

                {hoveredItem && (
                    <div className = "calendar-tooltip" style = {{ left: hoverPosition.x, top: hoverPosition.y }}>
                        <strong>{hoveredItem.type === 'event' ? hoveredItem.title : hoveredItem.task_name}</strong>
                        {hoveredItem.type === 'assessment' && (
                            <div>
                                    {hoveredItem.course_code}
                                    {hoveredItem.deadline && <div> Due: {formatTime(hoveredItem.deadline)}</div>}
                            </div>
                        )}
                        {hoveredItem.type === 'event' && (
                            <>
                            {hoveredItem.start_time && <div> Start time: {formatTime(hoveredItem.start_time)}</div>}
                            {hoveredItem.location && <div>Location: {hoveredItem.location}</div>}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}