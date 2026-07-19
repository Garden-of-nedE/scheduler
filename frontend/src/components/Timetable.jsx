import React, { useEffect, useState } from 'react'
import client from '../api/client'

export default function Timetable() {
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
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
        load()
    }, [])

    if (loading) return <p>Loading timetable ...</p>
    if (error) return <p style = {{ color: 'red' }}>{error}</p>

    return (
        <div>
            <h2>Weekly timetable</h2>
            {entries.length === 0 ? (
                <p>No classes scheduled</p>
            ) : (
                <ul>
                    {entries.map((entry) => 
                    <li key = {entry.id}>
                        {entry.course_code} - {entry.day_of_week} {entry.start_time}-{entry.end_time}
                        {entry.location && `@${entry.location}`}
                    </li>)}
                </ul>
            )}
        </div>
    )
}
