import React, { useEffect, useState } from 'react'
import client from '../api/client'
import Modal from './Modal.jsx'
import { formatDate, formatTime } from '../utils/formatters.js'

function emptyForm() {
    return {
        course_code: '',
        title: '',
        due_date: '',
        deadline: '23:59',
        weighting: '',
        total_marks: '',
        mark_achieved: '',
        completed: false
    }
}

export default function Assessments() {
    const [tasks, setTasks] = useState([])
    const [enrollments, setEnrollments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(emptyForm())
    const [formError, setFormError] = useState('')

    async function load() {
        setLoading(true)
        try{
            const [tasksRes, enrollmentsRes] = await Promise.all([
                client.get('/api/assessments'),
                client.get('/api/enrollments')
            ])
            setTasks(tasksRes.data)
            setEnrollments(enrollmentsRes.data)
        } catch (err) {
            setError('Could not load your assessments')
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

    function openEdit(task) {
        setEditingId(task.id)
        setForm({
            course_code: task.course_code,
            title: task.title || '',
            due_date: task.due_date,
            deadline: task.deadline ? task.deadline.slice(0, 5) : '',
            weighting: task.weighting,
            total_marks: task.total_marks,
            mark_achieved: task.mark_achieved ?? '',
            completed: task.completed || false
        })
        setFormError('')
        setModalOpen(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setFormError('')
        const payload = {
            ...form,
            deadline: form.deadline === '' ? null : form.deadline,
            mark_achieved: form.mark_achieved === '' ? null : Number(form.mark_achieved),
        }

        try{
            if (editingId) {
                await client.put(`/api/assessments/${editingId}`, payload)
            } else {
                await client.post('/api/assessments', payload)
            }
            setModalOpen(false)
            await load()
        } catch (err) {
            setFormError(err.response?.data?.detail || 'Could not save task')
        }
    }

    async function handleDelete(id) {
        if (!editingId) return
        try {
            await client.delete(`/api/assessments/${id}`)
            setModalOpen(false)
            await load()
        } catch (err) {
            setFormError('Could not delete this task')
        }
    }

    async function toggleCompleted(task) {
        try {
            await client.put(`/api/assessments/${task.id}`, { completed: !task.completed })
            await load()
        } catch (err) {
            setError('Could not update this task')
        }
    }

    if (loading) return <p>Loading assessments ...</p>
    if (error) return <p style = {{ color: 'red' }}>{error}</p>

    return (
        <div>
            <h2>Current Assessment List</h2>
            <button onClick = {openCreate} disabled = {enrollments.length === 0}>+ Add task</button>
            {enrollments.length === 0 && <p>Add a class under "Classes" before adding an assessment.</p>}

            {tasks.length === 0 ? (
                <p>No assessments added</p>
            ) : (
                <ul>
                    {tasks.map((task) => {
                        const enrollment = enrollments.find((e) => e.course_code === task.course_code)
                        return (
                            <li key = {task.id} style = {{ borderLeft : `4px solid ${enrollment?.color || '#4F6D7A'}`, paddingLeft: '8px' }}>
                            <button onClick = {() => openEdit(task)} style = {{ all: 'unset', cursor: 'pointer'}}>
                                {formatDate(task.due_date)} | {task.course_code} | {task.title} |{task.weighting}% | {task.total_marks} | 
                                {task.mark_achieved}
                            </button> {' '}
                            <button onClick = {() => toggleCompleted(task)}>
                                {task.completed ? '✓' : '○'}
                            </button> {' '}
                        </li>
                        )
                    })}
                </ul>
            )}

            {modalOpen && (
                <Modal title = {editingId ? 'Edit task' : 'Add tasks'} onClose = {() => setModalOpen(false)}>
                    <form onSubmit = {handleSubmit}>
                        {formError && <p style = {{ color: 'red' }}>{formError}</p>}

                        <div>
                            <label>Course Code</label>
                            <select
                                required
                                value = {form.course_code}
                                onChange = {(e) => setForm({ ...form, course_code: e.target.value})}
                            >
                                <option value = "" disabled>Select a class ...</option>
                                {enrollments.map((enr) => (
                                    <option key = {enr.id} value = {enr.course_code}>
                                        {enr.course_code}  {enr.course.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Task</label>
                            <input 
                                required
                                value = {form.title}
                                onChange = {(e) => setForm({ ...form, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>Due Date</label>
                            <input
                                type = "date"
                                required
                                value = {form.due_date}
                                onChange = {(e) => setForm({ ...form, due_date: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>Deadline (optional)</label>
                            <input
                                type = "time"
                                value = {form.deadline}
                                onChange = {(e) => setForm({ ...form, deadline: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>Weighting (%)</label>
                            <input 
                                type = "number"
                                step = "0.01"
                                required
                                value = {form.weighting}
                                onChange = {(e) => setForm({ ...form, weighting: e.target.value})}
                            />
                        </div>

                        <div>
                            <label>Total Marks</label>
                            <input
                                type = "number"
                                step = "0.01"
                                required
                                value = {form.total_marks}
                                onChange = {(e) => setForm({ ...form, total_marks: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>Mark Achieved</label>
                            <input
                                type = "number"
                                step = "0.01"
                                value = {form.mark_achieved}
                                onChange = {(e) => setForm({ ...form, mark_achieved: e.target.value })}
                            />
                        </div>

                        <div>
                            <label>
                                <input
                                    type = "checkbox"
                                    checked = {form.completed}
                                    onChange = {(e) => setForm({ ...form, completed: e.target.checked })}
                                />
                                {' '}Completed
                            </label>
                        </div>

                        <button type = "submit">{editingId? 'Save changes' : 'Add task'}</button>
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
