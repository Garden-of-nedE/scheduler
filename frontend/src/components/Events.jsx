import React, { useEffect, useState } from 'react'
import client from '../api/client'
import Modal from './Modal.jsx'
import { formatDate, formatTime } from '../utils/formatters.js'

function emptyForm() {
    return {
        title: '',
        description: '',
        date: '',
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
            date: event.date,
            start_time: event.start_time.slice(0, 16),
            end_time: event.end_time ? event.end_time.slice(0, 16) : '',
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
            <button onClick = {openCreate}>+ Add Event</button>

            {events.length === 0 ? (
                <p>No events scheduled.</p>
            ) : (
                <ul>
                    {events.map((event) => {
                        return (
                            <li key = {event.id}>
                            <button onClick = {() => openEdit(event)} style = {{ all: 'unset', cursor: 'pointer'}}>
                                {formatDate(event.date)} {formatTime(event.start_time)} | {event.title} | {event.location}
                            </button>{' '}
                        </li>
                        )
                    })}
                </ul>
            )}

            {modalOpen && (
                <Modal title = {editingId ? 'Edit event' : 'Add event'} onClose = {() => setModalOpen(false)}>
                    <form onSubmit = {handleSubmit}>
                        {formError && <p style = {{ color: 'red'}}>{formError}</p>}

                        <div>
                            <label>Title</label>
                            <input
                                required
                                value = {form.title}
                                onChange = {(e) => setForm({ ...form, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>Description</label>
                            <input
                                value = {form.description}
                                onChange = {(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>Date</label>
                            <input
                                type = "date"
                                required
                                value = {form.date}
                                onChange = {(e) => setForm({ ...form, date: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>Start Time</label>
                            <input
                                type = "time"
                                required
                                value = {form.start_time}
                                onChange = {(e) => setForm({ ...form, start_time: e.target.value})}
                            />
                        </div>

                        <div>
                            <label>End Time (Optional)</label>
                            <input
                                type = "time"
                                value = {form.end_time}
                                onChange = {(e) => setForm({ ...form, end_time: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>Location</label>
                            <input
                                value = {form.location}
                                onChange = {(e) => setForm({ ...form, location: e.target.value })}
                            />
                        </div>

                        <button type = "submit">{editingId? 'Save changes' : 'Add event'}</button>
                        {editingId && (
                            <button type = "button" onClick = {() => handleDelete(editingId)}>
                                Delete
                            </button>
                        )}
                    </form>
                </Modal>
            )}
        </div>
    )
}
