import React, { useState } from 'react'
import { getMonthViewForDate, getMonthGridDates } from '../../utils/calendarUtils.js'
import { formatTime } from '../../utils/formatters.js'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarMonthView({ currentDate, setCurrentDate, events, assessments }) {
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
                                    {items.map((item) => (
                                        <span 
                                            key = {item.id} 
                                            className = "month-day-dot" 
                                            style = {{ backgroundColor: item.type === 'event' ? '#B03DE1' : '#6EE13D' }}
                                            onMouseEnter = {(e) => handleMouseEnter(item, e)}
                                            onMouseLeave = {handleMouseLeave}
                                        />
                                    ))}
                                </div>
                            )}

                            {hoveredItem && (
                                <div className = "calendar-tooltip" style = {{ left: hoverPosition.x, top: hoverPosition.y }}>
                                    <strong>{hoveredItem.type === 'event' ? hoveredItem.title : hoveredItem.task_name}</strong>
                                    {hoveredItem.type === 'assessment' && (
                                        <div>{hoveredItem.course_code} | Due {hoveredItem.deadline ? formatTime(hoveredItem.deadline) : 'end of day'}</div>
                                    )}
                                    {hoveredItem.type === 'event' && hoveredItem.location &&  (
                                        <div>{hoveredItem.location}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}