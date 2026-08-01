import { useEffect, useState } from 'react'
import client from '../api/client'
import { getUpcomingReminders } from '../utils/notifications.js'
import { getReminderThreshold, getDismissedIds, dismissReminder } from '../utils/notificationPrefs.js'

export function useReminders() {
    const [reminders, setReminders] = useState([])

        async function load() {
            const [assessmentsRes, eventsRes] = await Promise.all([
                client.get('/api/assessments'),
                client.get('/api/events'),
            ])
            const threshold = getReminderThreshold()
            const upcoming = getUpcomingReminders(assessmentsRes.data, eventsRes.data, threshold)
            const dismissed = getDismissedIds()
            setReminders(upcoming.filter((r) => !dismissed.includes(r.id)))
        }

    useEffect(() => { load() }, [])

    return { reminders, refresh: load }
}