import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import Landing from '../components/landing/Landing.jsx'
// import Timetable from '../components/Timetable.jsx'
// import Classes from '../components/Classes.jsx'
import Assessments from '../components/Assessments.jsx'
import Events from '../components/Events.jsx'
import { SunIcon, MoonIcon, LogoutIcon } from '../components/icons/Icons.jsx'

const TABS = [
    // { key: 'timetable', label: 'Timetable'},
    { key: 'landing', label: 'Landing' },
    // { key: 'classes', label: 'Classes'},
    { key: 'assessments', label: 'Assessments'},
    { key: 'events', label: 'Events'},
]

export default function Dashboard() {
    const { user, logout } = useAuth()
    const [tab, setTab] = useState('landing')
    const { theme, toggleTheme } = useTheme()

    return (
        <div className = "page-container">
            <header>
                <h1>{user?.full_name ? `${user.full_name}'s Timetable` : 'Your Timetable'}</h1>
                <div className = "button-group">
                    <button className = "btn-icons" onClick={toggleTheme}>
                        {theme === 'light' ? <MoonIcon size = {18} />: <SunIcon size = {18} />}
                    </button>
                    <button className = "btn btn-secondary" onClick = {logout}>
                        Sign out
                        <LogoutIcon size = {16} />
                    </button>
                </div>
            </header>

            <div className = "dashboard-layout">
                <nav className = "sidebar-nav">
                    {TABS.map((t) => (
                        <button
                            key = {t.key}
                            className = "btn"
                            onClick = {() => setTab(t.key)}
                            disabled = {tab === t.key}
                        >
                            {t.label}
                        </button>
                    ))}
                </nav>

                <div className = "dashboard-content">
                    <main>
                        {/* {tab === 'timetable' && <Timetable />}
                        {tab === 'classes' && <Classes />} */}
                        {tab === 'landing' && <Landing />}
                        {tab === 'assessments' && <Assessments />}
                        {tab === 'events' && <Events />}
                    </main>
                </div>
            </div>
        </div>
    )
}