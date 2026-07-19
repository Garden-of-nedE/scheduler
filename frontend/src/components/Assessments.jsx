import React, { useEffect, useState } from 'react'
import client from '../api/client'
import { formatDate } from '../utils/formatters.js'

export default function Assessments() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function load() {
            try {
                const res = await client.get('/api/assessments')
                setTasks(res.data)
            } catch (err) {
                setError('Could not load your assessments')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <p>Loading assessments ...</p>
    if (error) return <p style = {{ color: 'red' }}>{error}</p>

    return (
        <div>
            <h2>Current Assessment List</h2>
            {tasks.length === 0 ? (
                <p>No assessments added.</p>
            ) : (
                <ul>
                    {tasks.map((task) => (
                        <li key = {task.id}>
                            {formatDate(task.due_date)} | {task.course_code} | {task.title} | {task.weighting} | {task.completed ? '✓' : '○'}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
