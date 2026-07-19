import React, { useEffect, useState } from 'react'
import client from '../api/client'
import { formatDateTime } from '../utils/formatters.js'

export default function Events() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function load() {
            try {
                const res = await client.get('/api/events')
                setEvents(res.data)
            } catch (err) {
                setError('Could not load your events')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <p>Loading events ...</p>
    if (error) return <p style = {{ color: 'red' }}>{error}</p>

    return (
        <div>
            <h2>Current Events</h2>
            {events.length === 0 ? (
                <p>No events scheduled.</p>
            ) : (
                <ul>
                    {events.map((event) => (
                        <li key = {event.id}>
                            {formatDateTime(event.start_time)} | {event.title} | {event.location}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
