import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import Timetable from '../components/Timetable.jsx'

const TABS = [
    { key: 'timetable', label: 'Timetable'},
    { key: 'assessments', label: 'Assessments'},
    { key: 'events', label: 'Events'},
]

export default function Dashboard() {
    const { user, logout } = useAuth()
    const [tab, setTab] = useState('timetable')

    return (
        <div>
            <header>
                <div>
                    <p>Semester</p>
                    <h1>{user?.full_name ? `${user.full_name}'s Timetable` : 'Your Timetable'}</h1>
                </div>
                <button onClick = {logout}>Sign out</button>
            </header>

            <nav>
                {TABS.map((t) => (
                    <button
                        key = {t.key}
                        onClick = {() => setTab(t.key)}
                        disabled = {tab === t.key}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>

            <main>
                {tab === 'timetable' && <Timetable />}
                {tab === 'assessments' && <div>Assessments view here</div>}
                {tab === 'events' && <div>Event view here</div>}
            </main>
        </div>
    )
}