import React from 'react'

export default function Modal({ title, onClose, children }) {
    return (
        <div className = "modal-overlay" onClick = {onClose}>
            <div className = "modal-box" onClick = {(e) => e.stopPropagation()}>
                <div className = "modal-header">
                    <h2>{title}</h2>
                    <button className = "modal-close" onClick = {onClose} aria-label = "Close">x</button>
                </div>
                <div className = "modal-body">{children}</div>
            </div>
        </div>
    )
}