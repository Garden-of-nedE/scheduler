import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import Home from '../components/home/Home.jsx'
import Assessments from '../components/Assessments.jsx'
import Events from '../components/Events.jsx'
import AccountModal from '../components/AccountModal.jsx'
import ToastNotifications from '../components/ToastNotifications.jsx'
import NotificationTab from '../components/NotificationTab.jsx'
import { SunIcon, MoonIcon, LogoutIcon, UserIcon } from '../components/icons/Icons.jsx'

const TABS = [
    { key: 'home', label: 'Home' },
    { key: 'assessments', label: 'Assessments'},
    { key: 'events', label: 'Events'},
]

export default function Dashboard() {
    const { user, logout } = useAuth()
    const [tab, setTab] = useState('home')
    const { theme, toggleTheme } = useTheme()
    const [accountModalOpen, setAccountModalOpen] = useState(false)

    return (
        <div className = "page-container">
            <header>
                <h1>{user?.full_name ? `${user.full_name}'s Timetable` : 'Your Timetable'}</h1>
                <div className = "button-group">
                    <NotificationTab />
                    <button className = "btn btn-secondary" onClick = {() => setAccountModalOpen(true)}>
                        <UserIcon size = {16} />
                        My Account
                    </button>
                    <button className = "btn-icons" onClick={toggleTheme}>
                        {theme === 'light' ? <MoonIcon size = {22} />: <SunIcon size = {22} />}
                    </button>
                    <button className = "btn btn-secondary" onClick = {logout}>
                        Sign out
                        <LogoutIcon size = {16} />
                    </button>
                </div>
            </header>

            <ToastNotifications />

            {accountModalOpen && <AccountModal onClose = {() => setAccountModalOpen(false)} />}

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
                        {tab === 'home' && <Home />}
                        {tab === 'assessments' && <Assessments />}
                        {tab === 'events' && <Events />}
                    </main>
                </div>
            </div>
        </div>
    )
}