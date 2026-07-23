export function formatDateTime(isoString) {
    return new Date(isoString).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString(undefined, {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
    })
}

export function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(Number(hours), Number(minutes))
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit'})
}

// CSS helpers
export function withOpacity(hexColor, opacity) {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0')
    return `${hexColor}${alpha}`
}

export function toMinutes(timeString) {
    const [h, m] = timeString.split(':').map(Number)
    return h * 60 + m
}

export function formatHourLabel(totalMinutes) {
    const hour = Math.floor(totalMinutes / 60)
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 === 0 ? 12 : hour % 12
    return `${displayHour} ${period}`
}