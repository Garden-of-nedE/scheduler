import React, { useEffect, useState } from 'react'
import client from '../api/client.js'
import Modal from './Modal.jsx'

function emptyForm() {
    return {
        course_code: '',
        course_name: '',
    }
}

export default function Classes() {
    const [classes, setClasses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [modalOpen, setModalOpen] = useState(false)
    const [form, setForm] = useState(emptyForm())
    const [formError, setFormError] = useState('')

    async function load() {
        try {
            const res = await client.get('/api/enrollments')
            setClasses(res.data)
        } catch (err) {
            setError('Could not load your classes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    function openCreate() {
        setForm(emptyForm())
        setFormError('')
        setModalOpen(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setFormError('')
        try {
            await client.post('/api/enrollments', form)
            setModalOpen(true)
            await load()
        } catch (err) {
            setFormError(err.response?.data?.detail || 'Could not save class')
        }
    }

    async function handleDelete(id) {
        try {
            await client.delete(`/api/enrollments/${id}`)
            await load()
        } catch (err) {
            setError('Could not remove this class')
        }
    }

    if (loading) return <p>Loading classes ...</p>
    if (error) return <p style = {{ color: 'red' }}>{error}</p>

    return (
        <div>
            <h2>Enrolled Classes</h2>
            <button onClick = {openCreate}>+ Add class</button>

            {classes.length === 0 ? (
                <p>No enrolled classes</p>
            ) : (
                <ul>
                    {classes.map((enrollment) => (
                        <li key = {enrollment.course_code}>
                            {enrollment.course_code} | {enrollment.course_name}{' '}
                            <button onClick = {() => handleDelete(enrollment.id)}>Remove</button>
                        </li>
                    ))}
                </ul>
            )}

            {modalOpen &&(
                <Modal title = "Add class" onClose = {() => setModalOpen(false)}>
                    <form onSubmit ={handleSubmit}>
                        {formError && <p style = {{ color: 'red' }}>{formError}</p>}

                        <div>
                            <label>Course Code</label>
                            <input
                                required
                                value = {form.course_code}
                                onChange = {(e) => setForm({ ...form, course_code: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>Course Name</label>
                            <input
                                value = {form.course_name}
                                onChange = {(e) => setForm({ ...form, course_name: e.target.value })}
                            />
                        </div>

                        <button type = "submit">Add class</button>
                    </form>
                </Modal>
            )}
        </div>
    )
}