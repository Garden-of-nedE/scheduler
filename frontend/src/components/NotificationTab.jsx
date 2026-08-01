import { useState } from 'react'
import { useReminders } from '../hooks/useReminders.js'
import { BellIcon } from './icons/Icons.jsx'

export default function NotificationTab() {
    const reminders = useReminders()
    const [open, setOpen] = useState(false)

    return (
        <div style = {{ position: 'relative' }}>
            <button className = "btn-icons" onClick = {() => setOpen(!open)}>
                <BellIcon size = {24} />
                {reminders.length > 0 && <span className = "notification-badge">{reminders.length}</span>}
            </button>

            {open && (
                <div className = "notification-dropdown">
                    {reminders.length === 0 ? (
                        <p>Nothing upcoming</p>
                    ) : (
                        reminders.map((r) => <div key = {r.id} className = "notification-item">{r.label}</div>)
                    )}
                </div>
            )}
        </div>
    )
}