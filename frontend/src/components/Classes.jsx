import React, { useEffect, useState } from 'react'
import client from '../api/client.js'
import Modal from './Modal.jsx'
import { withOpacity } from '../utils/formatters.js'
import { AddIcon, RemoveIcon, SaveIcon } from './icons/Icons.jsx'

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
    const [editingId, setEditingId] = useState(null)
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
        setEditingId(null)
        setForm(emptyForm())
        setFormError('')
        setModalOpen(true)
    }

    function openEdit(enrollment) {
        setEditingId(enrollment.id)
        setForm({
            course_code: enrollment.course_code,
            course_name: '',
            color: enrollment.color || '#4F6D7A'
        })
        setFormError('')
        setModalOpen(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setFormError('')
        try {
            if (editingId) {
                await client.put(`/api/enrollments/${editingId}`, { color: form.color })
            } else {
                await client.post('/api/enrollments', form)
            }
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
        <button className = "btn" onClick={openCreate}>
            <AddIcon size =  {16} />
            Add class
        </button>

        {classes.length === 0 ? (
            <p>No enrolled classes</p>
        ) : (
            <table className = "tables">
                <thead>
                    <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {classes.map((enrollment) => (
                        <tr key = {enrollment.id} style = {{ '--row-color': withOpacity(enrollment?.color || '#4F6D7A', 0.25)}}>
                            <td>
                                <button onClick = {() => openEdit(enrollment)} className = "link-button">
                                    {enrollment.course_code}
                                </button>
                            </td>
                            <td>{enrollment.course.name}</td>
                            <td>
                                <button className = "btn-icons" onClick = {() => handleDelete(enrollment.id)}>
                                    <RemoveIcon size = {18} /> Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}

        {modalOpen && (
            <Modal title = {editingId ? 'Edit class color' : 'Add class'} onClose = {() => setModalOpen(false)}>
                <form onSubmit = {handleSubmit}>
                    {formError && <p className = "form-error">{formError}</p>}

                    {!editingId && (
                    <>
                        <div className = "form-field">
                        <label>Course code</label>
                        <input
                            required
                            value = {form.course_code}
                            onChange = {(e) => setForm({ ...form, course_code: e.target.value })}
                        />
                        </div>

                        <div className = "form-field">
                        <label>Course name</label>
                        <input
                            value = {form.course_name}
                            onChange = {(e) => setForm({ ...form, course_name: e.target.value })}
                        />
                        </div>
                    </>
                    )}

                    <div className = "form-field">
                    <label>Color</label>
                    <input
                        type = "color"
                        value = {form.color}
                        onChange = {(e) => setForm({ ...form, color: e.target.value })}
                    />
                    </div>

                    <button type = "submit" className = "btn">
                        {editingId ? <SaveIcon size = {16} />: <AddIcon size = {16} />}
                        {editingId ? 'Save changes' : 'Add class'}
                    </button>
                </form>
            </Modal>
        )}
        </div>
    )
}