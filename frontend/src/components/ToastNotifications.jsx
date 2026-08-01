import { useState } from 'react'
import { useReminders } from '../hooks/useReminders.js'
import { getReminderThreshold, getDismissedIds, dismissReminder } from '../utils/notificationPrefs.js'
import { CrossIcon } from './icons/Icons.jsx'

export default function ToastNotifications() {
const { reminders } = useReminders()
    const [dismissed, setDismissed] = useState(getDismissedIds())
    
    const visible = reminders.filter((r) => !dismissed.includes(r.id))

    function handleDismiss(id) {
        dismissReminder(id)
        setDismissed((prev) => [...prev, id])   
    }

    if (visible.length === 0) return null

    return (
        <div className = "notification-banner-stack">
            {visible.map((r) => (
                <div key = {r.id} className = "notification-banner">
                    <span>{r.label}</span>
                    <button className = "btn-icons" onClick = {() => handleDismiss(r.id)}>
                        <CrossIcon size = {16} />
                    </button>
                </div>
            ))}
        </div>
    )
}