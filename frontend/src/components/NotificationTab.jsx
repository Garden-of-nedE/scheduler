import { useState } from 'react'
import { useReminders } from '../hooks/useReminders.js'
import { getRemovedDropdownIds, removeDropdownReminder } from '../utils/notificationPrefs.js'
import { BellIcon, CrossIcon } from './icons/Icons.jsx'

export default function NotificationTab() {
    const { reminders: liveReminders, refresh } = useReminders()
    const [removedIds, setRemovedIds] = useState(getRemovedDropdownIds())
    const [open, setOpen] = useState(false)

    const dropdownItems = liveReminders.filter((r) => !removedIds.includes(r.id))

    function handleRemove(id) {
        removeDropdownReminder(id)
        setRemovedIds((prev) => [...prev, id])
    }

    function handleToggle() {
        if (!open) refresh()
        setOpen(!open)
    }


    return (
        <div style = {{ position: 'relative' }}>
            <button className = "btn-icons" onClick = {() => handleToggle()}>
                <BellIcon size = {22} />
                {dropdownItems.length > 0 && <span className = "notification-badge">{dropdownItems.length}</span>}
            </button>

            {open && (
                <div className = "notification-dropdown">
                    {dropdownItems.length === 0 ? (
                        <p>Nothing upcoming</p>
                    ) : (
                        dropdownItems.map((r) => (
                            <div key = {r.id} className = "notification-item">
                                <span>{r.label} | {r.when}</span>
                                <button className = "btn-icons" onClick = {() => handleRemove(r.id)}>
                                    <CrossIcon size = {16} />
                                </button>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    )
}