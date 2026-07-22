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

export function withOpacity(hexColor, opacity) {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0')
    return `${hexColor}${alpha}`
}