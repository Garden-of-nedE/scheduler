import React, { useEffect, useState } from 'react'
import client from '../api/client'
import Modal from './Modal.jsx'
import { formatDate, formatTime } from '../utils/formatters.js'

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
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(emptyForm())
    const [formError, setFormError] = useState('')

    async function load() {
        setLoading(true)
        try {
            const res = await client.get('/api/events')
            setEvents(res.data)
        } catch (err) {
            setError('Could not load your events')
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

    async function handleDelete(id) {
        try{
            await client.delete(`/api/events/${id}`)
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
            <h2>Current Events</h2>
            <button type = "button" className = "btn" onClick = {openCreate}>+ Add Event</button>

            {events.length === 0 ? (
                <p>No events scheduled.</p>
            ) : (
                <ul>
                    {events.map((event) => {
                        return (
                            <li key = {event.id}>
                            <button onClick = {() => openEdit(event)} className = "link-button">
                                {formatDate(event.event_date)} {formatTime(event.start_time)} | {event.title} | {event.location}
                            </button>
                        </li>
                        )
                    })}
                </ul>
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
                            <button type = "submit" className = "btn">{editingId ? 'Save changes' : 'Add class'}</button>
                            {editingId && (
                                <button type = "button" className = "btn btn-danger" onClick = {handleDelete}>
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
