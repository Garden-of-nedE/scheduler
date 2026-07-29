import React, { useEffect, useState } from 'react'
import client from '../../api/client.js'
import Classes from './Classes.jsx'
import Timetable from './Timetable.jsx'

export default function Home() {
    const [timetableEntries, setTimetableEntries] = useState([])
    const [enrollments, setEnrollments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [viewMode, setViewMode] = useState('timetable')

    async function load() {
        setLoading(true)
        try {
            const [timetableRes, enrollmentsRes] = await Promise.all([
                client.get('../api/timetable'),
                client.get('../api/enrollments'),
            ])
            setTimetableEntries(timetableRes.data)
            setEnrollments(enrollmentsRes.data)
        } catch (err) {
            setError('Could not load your timetable')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    if (loading) return <p>Loading timetable ...</p>
    if (error) return <p className = "form-error">{error}</p>

    return (
        <div>
            <div className = "button-group">
                <button className = 'btn' onClick = {() => setViewMode('timetable')} disabled = {viewMode === 'timetable'}>
                    Timetable
                </button>
                <button className = "btn" onClick = {() => setViewMode('classes')} disabled = {viewMode === 'classes'}>
                    Classes
                </button>
            </div>

            {viewMode === 'timetable' ? <Timetable /> : <Classes />}
        </div>
    )
}