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

export function overlappingItems(items, getStart, getEnd) {
    const sorted = [...items].sort((a, b) => getStart(a) - getStart(b))
    const clusters = []

    for (const item of sorted) {
        const start = getStart(item)
        let placed = false

        for (const cluster of clusters) {
            if (start < cluster.maxEnd) {
                cluster.items.push(item)
                cluster.maxEnd = Math.max(cluster.maxEnd, getEnd(item))
                placed = true
                break
            }
        }

        if (!placed) {
            clusters.push({ items: [item], maxEnd: getEnd(item) })
        }
    }

    const layout = new Map()

    for (const cluster of clusters) {
        const columns = []
        
        for (const item of cluster.items) {
            const start = getStart(item)
            let columnIndex = columns.findIndex((colEnd) => start > colEnd)

            if (columnIndex === -1) {
                columnIndex = columns.length
                columns.push(getEnd(item))
            } else {
                columns[columnIndex] = getEnd(item)
            }

            layout.set(item, { columnIndex, totalColumns: 0 })
        }

        const totalColumns = columns.length
        for (const item of cluster.items) {
            layout.get(item).totalColumns = totalColumns
        }
    }

    return layout
}