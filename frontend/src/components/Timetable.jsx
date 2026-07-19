import React, { useEffect, useState } from 'react'
import client from '../api/client'
import Modal from './Modal.jsx'
import { formatTime} from '../utils/formatters.js'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function emptyForm() {
    return {
        course_code: '',
        course_name: '',
        class_type: '',
        day_of_week: 'monday',
        start_time: '08:00',
        end_time: '10:00',
        location: '',
        color: '#4F6D7A'
    }
}

export default function Timetable() {
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    
    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, seteditingId] = useState(null)
    const [form, setForm] = useState(emptyForm())
    const [formError, setFormError] = useState('') 
    
    async function load() {
        try {
            const res = await client.get('/api/timetable')
            setEntries(res.data)
        } catch (err) {
            setError('Could not load your timetable')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    function openCreate() {
        seteditingId(null)
        setForm(emptyForm())
        setFormError('')
        setModalOpen(true)
    }

    function openEdit(entry) {
        seteditingId(entry.id)
        setForm({
            course_code: entry.course_code,
            course_name: entry.course_name || '',
            class_type: entry.class_type || '',
            day_of_week: entry.day_of_week,
            start_time: entry.start_time.slice(0, 5),
            end_time: entry.end_time.slice(0, 5),
            location: entry.location || '',
            color: entry.color || '#4F6D7A'
        })
        setFormError('')
        setModalOpen(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setFormError('')
        try {
            if (editingId) {
                await client.put(`/api/timetable/${editingId}`, form)
            } else {
                await client.post('/api/timetable', form)
            }
            setModalOpen(true)
            await load()
        } catch (err) {
            setFormError(err.response?.data?.detail || 'Could not save this class.')
        }
    }

    async function handleDelete() {
        if (!editingId) return
        try {
            await client.delete(`/api/timetable/${editingId}`)
            setModalOpen(false)
            await load()
        } catch (err) {
            setFormError('Could not delete this class.')
        }
    }

    if (loading) return <p>Loading timetable ...</p>
    if (error) return <p style = {{ color: 'red' }}>{error}</p>

    return (
        <div>
            <h2>Weekly timetable</h2>
            <button onClick = {openCreate}>+ Add class</button>

            {entries.length === 0 ? (
                <p>No classes scheduled</p>
            ) : (
                <ul>
                    {entries.map((entry) => (
                        <li key = {entry.id}>
                            <button onClick = {() => openEdit(entry)} style = {{ all: 'unset', cursor: 'pointer'}}>
                                {entry.day_of_week} | {entry.course_code} {entry.course_name} | {formatTime(entry.start_time)}-{formatTime(entry.end_time)}
                                | {entry.class_type} | {entry.location}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {modalOpen && (
                <Modal title = {editingId ? 'Edit class' : 'Add class'} onClose ={() => setModalOpen(false)}>
                    <form onSubmit = {handleSubmit}>
                        {formError && <p style = {{ color: 'red'}}>{formError}</p>}
                        
                        <div>
                            <label>Course code</label>
                            <input
                                required
                                value = {form.course_code}
                                onChange = {(e) => setForm({ ...form, course_code: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>Course name</label>
                            <input
                                value = {form.course_name}
                                onChange = {(e) => setForm({ ...form, course_name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>Class type</label>
                            <input
                                value = {form.class_type}
                                onChange = {(e) => setForm({ ...form, class_type: e.target.value})}
                            />
                        </div>

                        <div>
                            <label>Day</label>
                            <select
                                value = {form.day_of_week}
                                onChange = {(e) => setForm({ ...form, day_of_week: e.target.value })}
                            >
                                {DAYS.map((d) => (
                                    <option key = {d} value = {d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Start time</label>
                            <input
                                type = "time"
                                required
                                value = {form.start_time}
                                onChange = {(e) => setForm({ ...form, start_time: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>End time</label>
                            <input
                                type = "time"
                                required
                                value = {form.end_time}
                                onChange = {(e) => setForm({ ...form, end_time: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>Location</label>
                            <input 
                                type = "text"
                                value = {form.location}
                                onChange = {(e) => setForm({ ...form, location: e.target.value })}
                            />
                        </div>

                        <button type = "submit">{editingId ? 'Save changes' : 'Add class'}</button>
                        {editingId && (
                            <button type = "button" onClick = {handleDelete}>
                                Delete
                            </button>
                        )}
                    </form>
                </Modal>
            )}
        </div>
    )
}
