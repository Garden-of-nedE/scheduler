import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import Timetable from '../components/Timetable.jsx'
import Classes from '../components/Classes.jsx'
import Assessments from '../components/Assessments.jsx'
import Events from '../components/Events.jsx'

const TABS = [
    { key: 'timetable', label: 'Timetable'},
    { key: 'classes', label: 'Classes'},
    { key: 'assessments', label: 'Assessments'},
    { key: 'events', label: 'Events'},
]

export default function Dashboard() {
    const { user, logout } = useAuth()
    const [tab, setTab] = useState('timetable')
    const { theme, toggleTheme } = useTheme()

    return (
        <div className = 'page-container'>
            <header>
                <div>
                    <h1>{user?.full_name ? `${user.full_name}'s Timetable` : 'Your Timetable'}</h1>
                </div>
                <button onClick={toggleTheme}>{theme === 'light' ? '🌙 Dark' : '☀️ Light'}</button>
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
                {tab === 'classes' && <Classes />}
                {tab === 'assessments' && <Assessments />}
                {tab === 'events' && <Events />}
            </main>
        </div>
    )
}