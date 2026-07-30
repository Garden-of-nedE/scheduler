import React, { useEffect, useState } from 'react'
import client from '../api/client'
import Modal from './Modal.jsx'
import CalendarMonthView from './calendar/CalendarMonthView.jsx'
import CalendarWeekView from './calendar/CalendarWeekView.jsx'
import { formatDate, formatTime } from '../utils/formatters.js'
import { AddIcon, SaveIcon, TrashIcon } from './icons/Icons.jsx' 

function emptyForm() {
    return {
        title: '',
        description: '',
        event_date: '',
        start_time: '',
        end_time: '',
        location: '',
    }
}

export default function Events() {
    const [events, setEvents] = useState([])
    const [assessments, setAssessments] = useState([])
    const [timetableEntries, setTimetableEntries] = useState([])
    const [enrollments, setEnrollments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(emptyForm())
    const [formError, setFormError] = useState('')

    const [viewMode, setViewMode] = useState('list')
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

    function openCreate() {
        setEditingId(null)
        setForm(emptyForm())
        setFormError('')
        setModalOpen(true)
    }

    function openEdit(event) {
        setEditingId(event.id)
        setForm({
            title: event.title,
            description: event.description || '',
            event_date: event.event_date,
            start_time: event.start_time.slice(0, 5),
            end_time: event.end_time ? event.end_time.slice(0, 5) : '',
            location: event.location || '',
        })
        setFormError('')
        setModalOpen(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setFormError('')
        const payload = {
            ...form, 
            end_time: form.end_time === '' ? null : form.end_time,
        }

        try {
            if (editingId) {
                await client.put(`/api/events/${editingId}`, payload)
            } else {
                await client.post('/api/events', payload)
            }
            setModalOpen(false)
            await load()
        } catch (err) {
            setFormError(err.response?.data?.detail || 'Could not save event')
        }
    }

    async function handleDelete() {
        try{
            await client.delete(`/api/events/${editingId}`)
            setModalOpen(false)
            await load()
        } catch (err) {
            setFormError('Could not delete this event')
        }
    }

    if (loading) return <p>Loading events ...</p>
    if (error) return <p style = {{ color: 'red' }}>{error}</p>

    return (
        <div>
            <div className = "calendar-nav">
                <h2>Events</h2>
                <div className = "button-group">
                    <button type = "button" className = "btn" onClick = {openCreate}>
                        <AddIcon size = {16} />
                        Add Event
                    </button>
                    <button className = "btn btn-secondary" onClick = {() => setViewMode('list')} disabled = {viewMode === 'list'}>
                        List
                    </button>
                    <button className = "btn btn-secondary" onClick = {() => setViewMode('month')} disabled = {viewMode === 'month'}>
                        Month
                    </button>
                    <button className = "btn btn-secondary" onClick = {() => setViewMode('week')} disabled = {viewMode === 'week'}>
                        Week
                    </button>
                </div>
            </div>

            {viewMode === 'list' && (
                events.length === 0 ? (
                    <p>No events scheduled.</p>
                ) : (
                    <table className = "tables">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Title</th>
                                <th>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => (
                                <tr key = {event.id}>
                                    <td>{formatDate(event.event_date)}</td>
                                    <td>{event.start_time && `${formatTime(event.start_time)}`}</td>
                                    <td>
                                        <button className = "link-button" onClick = {() => openEdit(event)}>{event.title}</button>
                                    </td>
                                    <td>{event.location}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            )}

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

            {modalOpen && (
                <Modal title = {editingId ? 'Edit event' : 'Add event'} onClose = {() => setModalOpen(false)}>
                    <form onSubmit = {handleSubmit}>
                        {formError && <p style = {{ color: 'red' }}>{formError}</p>}

                        <div className = "form-field">
                            <label>Title</label>
                            <input
                                required
                                value = {form.title}
                                onChange = {(e) => setForm({ ...form, title: e.target.value })}
                            />
                        </div>

                        <div className = "form-field">
                            <label>Description</label>
                            <input
                                value = {form.description}
                                onChange = {(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>

                        <div className = "form-field">
                            <label>Date</label>
                            <input
                                type = "date"
                                required
                                value = {form.event_date}
                                onChange = {(e) => setForm({ ...form, event_date: e.target.value })}
                            />
                        </div>

                        <div className = "form-field">
                            <label>Start Time</label>
                            <input
                                type = "time"
                                required
                                value = {form.start_time}
                                onChange = {(e) => setForm({ ...form, start_time: e.target.value})}
                            />
                        </div>

                        <div className = "form-field">
                            <label>End Time (Optional)</label>
                            <input
                                type = "time"
                                value = {form.end_time}
                                onChange = {(e) => setForm({ ...form, end_time: e.target.value })}
                            />
                        </div>

                        <div className = "form-field">
                            <label>Location</label>
                            <input
                                value = {form.location}
                                onChange = {(e) => setForm({ ...form, location: e.target.value })}
                            />
                        </div>

                        <div className = "button-group">
                            <button type = "submit" className = "btn">
                                {editingId ? <SaveIcon size = {16} />: <AddIcon size = {16} />}
                                {editingId ? 'Save changes' : 'Add event'}
                            </button>
                            {editingId && (
                                <button type = "button" className = "btn btn-danger" onClick = {handleDelete}>
                                    <TrashIcon size = {16} />
                                    Delete
                                </button>
                            )}
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    )
}
