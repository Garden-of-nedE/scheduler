const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// week view - includes timetable classes
export function getWeekViewForDate(date, events, assessments, timetableEntries) {
    const dayOfWeek = DAY_NAMES[date.getDay()]
    const dateStr = toDateString(date)

    return [
        ...events.filter(e => e.event_date === dateStr).map(e => ({ type: 'event', ...e})),
        ...assessments.filter(a => a.due_date === dateStr).map(a => ({ type: 'assessment', ...a})),
        ...timetableEntries.filter(t => t.day_of_week === dayOfWeek).map(t => ({ type: 'class', ...t})),
    ]
}

// month view - only events and assessments
export function getMonthViewForDate(date, events, assessments) {
    const dateStr = toDateString(date)

    return [
        ...events.filter(e => e.event_date === dateStr).map(e => ({ type: 'event', ...e})),
        ...assessments.filter(a => a.due_date === dateStr).map(a => ({ type: 'assessment', ...a})),
    ]
}

export function getMonthGridDates(year, month) {
    // JS Date convention has month as 0-index
    const firstOfMonth = new Date(year, month, 1)
    const startOffset = firstOfMonth.getDay()   // 0 = Sunday

    const gridStart = new Date(year, month, 1 - startOffset)

    const dates = []
    for (let i = 0; i < 42; i++) {
        const d = new Date(gridStart)
        d.setDate(gridStart.getDate() + i)
        dates.push(d)
    }
    return dates
}

function toDateString(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}