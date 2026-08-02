const STORAGE_KEY = 'reminder_threshold_hours'
const REMOVED_KEY = 'removed_dropdown_reminders'

export function getReminderThreshold() {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? Number(stored) : 24
}

export function setReminderThreshold(hours) {
    localStorage.setItem(STORAGE_KEY, String(hours))
}

export function getRemovedDropdownIds() {
    const stored = localStorage.getItem(REMOVED_KEY)
    return stored ? JSON.parse(stored) : []
}

export function removeDropdownReminder(id) {
    const removed = getRemovedDropdownIds()
    if (!removed.includes(id)) {
        localStorage.setItem(REMOVED_KEY, JSON.stringify([...removed, id]))
    }
}