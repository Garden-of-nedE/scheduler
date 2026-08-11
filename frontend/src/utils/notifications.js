import { formatDateShort, formatTime } from './formatters.js'

export function getUpcomingReminders(assessments, events, thresholdHours) {
    const now = new Date()
    const threshold = new Date(now.getTime() + thresholdHours * 60 * 60 * 1000)

    const dueAssessments = assessments.filter((a) => {
        if (a.completed) return false
        const due = new Date(`${a.due_date}T${a.deadline || '23:59:59'}`)
        return due >= now && due <= threshold
    })

    const upcomingEvents = events.filter((e) => {
        const start = new Date(`${e.event_date}T${e.start_time}`)
        return start >= now && start <= threshold
    })

    return [
        ...dueAssessments.map((a) => ({ type: 'assessment', id: a.id, label: `${a.course_code}: ${a.task_name} |`, when: `Due ${formatDateShort(a.due_date)} ${formatTime(a.deadline) || '23:59:00'}` })),
        ...upcomingEvents.map((e) => ({ type: 'event', id: e.id, label: e.title, when: `${formatDateShort(e.event_date)} ${formatTime(e.start_time)}` })),
    ]
}