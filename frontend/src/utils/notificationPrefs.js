const STORAGE_KEY = 'reminder_threshold_hours'
const DISMISSED_KEY = 'dismissed_reminders'

export function getReminderThreshold() {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? Number(stored) : 24
}

export function setReminderThreshold(hours) {
    localStorage.setItem(STORAGE_KEY, String(hours))
}

export function getDismissedIds() {
    const stored = localStorage.getItem(DISMISSED_KEY)
    return stored ? JSON.parse(stored) : []
}

export function dismissReminder(id) {
    const dismissed = getDismissedIds()
    if (!dismissed.includes(id)) {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed, id]))
    }
}