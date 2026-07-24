import React, { useEffect, useState } from 'react'
import client from '../../api/client.js'
import { getWeekViewForDate, getMonthViewForDate } from '../../utils/calendarUtils.js'
import CalendarMonthView from './CalendarMonthView.jsx'
import CalendarWeekView from './CalendarWeekView.jsx'

export default function EventsCalendar() {
    const [events, setEvents] = useState([])
    const [assessments, setAssessments] = useState([])
    const [timetableEntries, setTimetableEntries] = useState([])
    const [enrollments, setEnrollments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [viewMode, setViewMode] = useState('month')
    const [currentDate, setCurrentDate] = useState(new Date())

    async function load() {
        setLoading(true)
        try {
            const [eventsRes, assessmentsRes, timetableRes, enrollmentsRes] = await Promise.all([
                client.get('../api/events'),
                client.get('../api/assessments'),
                client.get('../api/timetable'),
                client.get('../api/enrollments'),
            ])
            setEvents(eventsRes.data)
            setAssessments(assessmentsRes.data)
            setTimetableEntries(timetableRes.data)
            setEnrollments(enrollmentsRes.data)
        } catch (err) {
            setError('Could not load your calendar')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    useEffect(() => {
        if (!loading) {
            console.log('Month View for ', currentDate.toDateString(), ':', getMonthViewForDate(currentDate, events, assessments))
            console.log('Week View for ', currentDate.toDateString(), ':', getWeekViewForDate(currentDate, events, assessments, timetableEntries))
        }
    }, [loading, currentDate, events, assessments, timetableEntries])

    if (loading) return <p>Loading calendar ...</p>
    if (error) return <p className = "form-error">{error}</p>

    return (
        <div>
            <div className = "button-group">
                <button className = 'btn' onClick = {() => setViewMode('month')} disabled = {viewMode === 'month'}>
                    Month
                </button>
                <button className = "btn" onClick = {() => setViewMode('week')} disabled = {viewMode === 'week'}>
                    Week
                </button>
            </div>

            {viewMode === 'month' && (
                <CalendarMonthView
                    currentDate = {currentDate}
                    setCurrentDate = {setCurrentDate}
                    events = {events}
                    assessments = {assessments}
                    enrollments = {enrollments}
                />
            )}

            {viewMode === 'week' && (
                <CalendarWeekView
                    currentDate = {currentDate}
                    setCurrentDate = {setCurrentDate}
                    events = {events}
                    assessments = {assessments}
                    timetableEntries = {timetableEntries}
                    enrollments = {enrollments}
                />
            )}
        </div>
    )
}