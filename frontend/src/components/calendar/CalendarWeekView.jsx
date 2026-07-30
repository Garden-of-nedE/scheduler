import React, { cacheSignal, useState } from 'react'
import { getWeekViewForDate } from '../../utils/calendarUtils.js'
import { formatHourLabel, formatTime, toMinutes, withOpacity, overlappingItems } from '../../utils/formatters.js'
import { PrevIcon, NextIcon } from '../icons/Icons.jsx'

const DAY_START_MIN = 0
const DAY_END_MIN = 24 * 60
const PX_PER_MIN = 0.6      // each hour is 36px
const HEADER_HEIGHT = 40

const EVENT_COLOR = '#B03DE1'

function getWeekDates(currentDate) {
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay()) // back up to Sunday

    const dates = []
    for (let i = 0; i < 7; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        dates.push(d)
    }
    return dates
}

export default function CalendarWeekView({ currentDate, setCurrentDate, events, assessments, timetableEntries, enrollments }) {
    const weekDates = getWeekDates(currentDate)
    const gridHeight = DAY_END_MIN - DAY_START_MIN

    const [hoveredItem, setHoveredItem] = useState(null)
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
    
    const hourMarks = []
    for (let m = DAY_START_MIN; m <= DAY_END_MIN; m += 60) {
        hourMarks.push(m)
    }

    function goToPrevWeek() {
        const d = new Date(currentDate)
        d.setDate(d.getDate() - 7)
        setCurrentDate(d)
    }

    function goToNextWeek() {
        const d = new Date(currentDate)
        d.setDate(d.getDate() + 7)
        setCurrentDate(d)
    }

    function handleMouseEnter(item, e) {
        const rect = e.currentTarget.getBoundingClientRect()
        setHoveredItem(item)
        setHoverPosition({ x: rect.left + rect.width /2, y: rect.top })
    }

    function handleMouseLeave() {
        setHoveredItem(null)
    }

    return (
        <div>
            <div className = "calendar-nav button-group">
                <button className = "btn btn-secondary" onClick = {goToPrevWeek}>
                    <PrevIcon size = {18} />
                    Prev
                </button>
                <h3>{weekDates[0].toDateString()} - {weekDates[6].toDateString()}</h3>
                <button className = "btn btn-secondary" onClick = {goToNextWeek}>
                    Next
                    <NextIcon size = {18} />
                </button>
            </div>

            <div className = "week-grid-scroll">
                <div className = "week-grid">
                    <div className = "week-grid-gutter">
                        <div className = "week-grid-corner">
                            {hourMarks.slice(1, -1).map((m) => (
                                <div key = {m} className = "hour-label" style = {{ top: HEADER_HEIGHT + (m - DAY_START_MIN) * PX_PER_MIN }}>
                                    {formatHourLabel(m)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {weekDates.map((date) => {
                        const items = getWeekViewForDate(date, events, assessments, timetableEntries)

                        const layout = overlappingItems(
                            items,
                            (item) => {
                                const t = item.type === 'class' ? item.start_time : (item.start_time || item.deadline || '00:00:00')
                                return toMinutes(t)
                            },
                            (item) => {
                                if (item.type === 'class' || item.end_time) {
                                    return toMinutes(item.end_time)
                                }

                                return toMinutes(item.start_time || item.deadline) + 30
                            }
                        )
                        
                        return (
                            <div key = {date.toISOString()} className = "week-grid-day">
                                <div className = "week-grid-day-header">
                                    {date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                                </div>

                                <div className = "week-grid-day-body" style = {{ height: gridHeight * PX_PER_MIN, '--hour-height' : `${60 * PX_PER_MIN}px` }}>
                                    {items.map((item) => {
                                        const startTime = item.type === 'class' ? item.start_time : (item.start_time || item.deadline || '11:59:00')
                                        const endTime = item.type === 'class' ? item.end_time : (item.end_time || null)
                                        const start = toMinutes(startTime) - DAY_START_MIN
                                        const end = endTime ? toMinutes(endTime) - DAY_START_MIN : start + 30

                                        const { columnIndex, totalColumns } = layout.get(item)
                                        const widthPercent = 100 / totalColumns
                                        const leftPercent = columnIndex * widthPercent

                                        const courseCode = item.course_code
                                        const enrollment = enrollments?.find((e) => e.course_code === courseCode)
                                        const color = enrollment?.color || EVENT_COLOR

                                        return (
                                            <div
                                                key = {`${item.type}-${item.id}`}
                                                className = "week-entry"
                                                style = {{
                                                    top: start * PX_PER_MIN,
                                                    height: Math.max((end - start) * PX_PER_MIN, 24),
                                                    left: `calc(${leftPercent}% + 2px)`,
                                                    width: `calc(${widthPercent}% - 4px)`,
                                                    backgroundColor: withOpacity(color, 0.85),
                                                }}
                                                onMouseEnter = {(e) => handleMouseEnter(item, e)}
                                                onMouseLeave = {handleMouseLeave}
                                            >
                                                <div className = "week-entry-title">
                                                    {item.type === 'class' ? item.course_code : item.type === 'assessment' ? item.task_name : item.title}
                                                </div>
                                                <div className = "week-entry-time">
                                                    {item.type === 'class' ? `${formatTime(item.start_time)} - ${formatTime(item.end_time)}` 
                                                    : item.type === 'event' ? formatTime(item.start_time) 
                                                    : formatTime(item.deadline)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {hoveredItem && (
                <div className = "calendar-tooltip" style = {{ left: hoverPosition.x, top: hoverPosition.y }}>
                    <strong>
                        {hoveredItem.type === 'class' ? hoveredItem.course_code : hoveredItem.type === 'assessment' ? hoveredItem.task_name : hoveredItem.title}
                    </strong>
                    {hoveredItem.type === 'class' && (
                        <div>
                            {hoveredItem.class_type} | {hoveredItem.location}
                        </div>
                    )}
                    {hoveredItem.type === 'assessment' && (
                        <div>
                            {hoveredItem.course_code}
                            {hoveredItem.deadline && <div>Due: {formatTime(hoveredItem.deadline)}</div>}
                        </div>
                    )}
                    {hoveredItem.type === 'event' && (
                        <div>
                            {hoveredItem.location} | {hoveredItem.description}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
