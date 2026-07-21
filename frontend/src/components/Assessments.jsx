import React, { useEffect, useState } from 'react'
import client from '../api/client'
import Modal from './Modal.jsx'
import { formatDate, formatTime } from '../utils/formatters.js'

function emptyForm() {
    return {
        course_code: '',
        task_name: '',
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

    const [isRecurring, setIsRecurring] = useState(false)
    const [recurrence, setRecurrence] = useState({
        occurrences: '',
        first_due_date: '',
        skip_dates: [],
    })
    const [skipDateInput, setSkipDateInput] = useState('')

    const [sortOrder, setSortOrder] = useState('asc')
    const [filters, setFilters] = useState({
        course_code: '',
        status: 'all',
    })

    const filteredTasks = tasks.filter((task) => {
        if (filters.course_code && task.course_code !== filters.course_code) return false
        if (filters.status === 'completed' && !task.completed) return false
        if (filters.status === 'incompleted' && task.completed) return false
        return true
    })
    .sort((a, b) => {
        const comparison = a.due_date.localeCompare(b.due_date)
        return sortOrder === 'asc' ? comparison : -comparison
    })

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
        setIsRecurring(false)
        setRecurrence({ occurrences: '', first_due_date: '', skip_dates: [] })
        setSkipDateInput('')
        setFormError('')
        setModalOpen(true)
    }

    function openEdit(task) {
        setEditingId(task.id)
        setForm({
            course_code: task.course_code,
            task_name: task.task_name || '',
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
            if (isRecurring) {
                const recurringPayload = {
                    course_code: form.course_code,
                    task_name: form.task_name,
                    description: form.description,
                    deadline: form.deadline === '' ? null : form.deadline,
                    weighting: form.weighting,
                    total_marks: form.total_marks,
                    recurrence: {
                        frequency: 'weekly',
                        occurrences: Number(recurrence.occurrences),
                        first_due_date: recurrence.first_due_date,
                        skip_dates: recurrence.skip_dates,
                    },
                }
                await client.post('/api/assessments/recurring', recurringPayload)
            } else if (editingId) {
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

    function weightedMark(task) {
        if (task.mark_achieved == null) return null
        return ((task.mark_achieved/task.total_marks) * task_weighting).toFixed(2)
    }

    if (loading) return <p>Loading assessments ...</p>
    if (error) return <p style = {{ color: 'red' }}>{error}</p>

    return (
        <div>
            <h2>Current Assessment List</h2>
            <button onClick = {openCreate} disabled = {enrollments.length === 0}>+ Add task</button>            
            {enrollments.length === 0 && <p>Add a class under "Classes" before adding an assessment.</p>}

            <div style = {{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <select 
                    value = {filters.course_code}
                    onChange = {(e) => setFilters({ ...filters, course_code: e.target.value })}
                >
                    <option value = "">All courses</option>
                    {enrollments.map((enr) => (
                        <option key = {enr.id} value = {enr.course_code}>{enr.course_code}</option>
                    ))}
                </select>

                <select 
                    value = {filters.status}
                    onChange = {(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value = "all">All</option>
                    <option value = "completed">Completed</option>
                    <option value = "incompleted">Incompleted</option>
                </select>
                <button onClick = {() => setFilters({ course_code: '', status: 'all' })}>
                    Clear filters
                </button>
            </div>

            {filteredTasks.length === 0 ? (
                <p>No assessments added</p>
            ) : (
                <table style = {{ borderCollapse: 'collapse', width: '100%'}}>
                    <thead>
                        <tr>
                            <th onClick = {() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} style = {{ cursor: 'pointer' }}>
                                Due Date {sortOrder === 'asc' ? '↑' : '↓'}
                            </th>
                            <th>Course</th>
                            <th>Task Name</th>
                            <th>Weighting</th>
                            <th>Description</th>
                            <th>Mark</th>
                            <th>Weighted Mark</th>
                            <th>Completed</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.map((task) => {
                            const enrollment = enrollments.find((e) => e.course_code === task.course_code)
                            return (
                                <tr key = {task.id} style = {{ borderLeft: `4px solid ${enrollment?.color || '#4F6D7A'}`}}>
                                    <td>{formatDate(task.due_date)}</td>
                                    <td>{task.course_code}</td>
                                    <td>
                                        <button onClick = {() => openEdit(task)} style = {{ all: 'unset', cursor: 'pointer' }}>
                                            {task.task_name}
                                        </button>
                                    </td>
                                    <td>{task.weighting}%</td>
                                    <td>{task.description}</td>
                                    <td>{task.mark_achieved != null ? `${task.mark_achieved}/${task.total_marks}` : `—/${task.total_marks}`}</td>
                                    <td>{weightedMark(task) != null ? `${weightedMark(task)}%` : '—'}</td>
                                    <td>
                                        <button onClick = {() => toggleCompleted(task)}>{task.completed ? '✓' : '□'}</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}

            {modalOpen && (
                <Modal task_name = {editingId ? 'Edit task' : 'Add task'} onClose = {() => setModalOpen(false)}>
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
                                value = {form.task_name}
                                onChange = {(e) => setForm({ ...form, task_name: e.target.value })}
                            />
                        </div>

                        {!editingId && (
                            <div>
                                <label>
                                    <input
                                        type = "checkbox"
                                        checked = {isRecurring}
                                        onChange = {(e) => setIsRecurring(e.target.checked)}
                                    />
                                    {' '}Repeat weekly
                                </label>
                            </div>
                        )}

                        {isRecurring ? (
                            <>
                                <div>
                                    <label>Number of occurrences</label>
                                    <input
                                        type = "number"
                                        min = "1"
                                        required
                                        value = {recurrence.occurrences}
                                        onChange = {(e) => setRecurrence({ ...recurrence, occurrences: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label>First due date</label>
                                    <input
                                        type = "date"
                                        required
                                        value = {recurrence.first_due_date}
                                        onChange = {(e) => setRecurrence({ ...recurrence, first_due_date: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label>Skip a date</label>
                                    <input
                                        type = "date"
                                        value = {skipDateInput}
                                        onChange = {(e) => setSkipDateInput(e.target.value)}
                                    />
                                    <button
                                        type = "button"
                                        onClick = {() => {
                                            if (skipDateInput && !recurrence.skip_dates.includes(skipDateInput)) {
                                                setRecurrence({ ...recurrence, skip_dates: [...recurrence.skip_dates, skipDateInput] })
                                                setSkipDateInput('')
                                            }
                                        }}
                                    >
                                        + Add skip date
                                    </button>

                                    {recurrence.skip_dates.length > 0 && (
                                        <ul>
                                            {recurrence.skip_dates.map((d) => (
                                                <li key = {d}>
                                                    {d}{' '}
                                                    <button
                                                        type = "button"
                                                        onClick = {() => setRecurrence({
                                                            ...recurrence,
                                                            skip_dates: recurrence.skip_dates.filter((sd) => sd !== d)
                                                        })}
                                                    >
                                                        Remove
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div>
                                <label>Due date</label>
                                <input
                                    type = "date"
                                    required
                                    value = {form.due_date}
                                    onChange = {(e) => setForm({ ...form, due_date: e.target.value })}
                                />
                            </div>
                        )}

                        <div>
                            <label>Description</label>
                            <input
                                value = {form.description}
                                onChange = {(e) => setForm({ ...form, description: e.target.value })}
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
                            <label>Deadline (optional)</label>
                            <input
                                type = "time"
                                value = {form.deadline}
                                onChange = {(e) => setForm({ ...form, deadline: e.target.value })}
                            />
                        </div>

                        <button type = "submit">{editingId ? 'Save changes' : 'Add task'}</button>
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
