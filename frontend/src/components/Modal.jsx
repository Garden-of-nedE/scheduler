import React from 'react'
import { CrossIcon } from '../components/icons/Icons.jsx'

export default function Modal({ title, onClose, children }) {
    return (
        <div className = "modal-overlay" onClick = {onClose}>
            <div className = "modal-box" onClick = {(e) => e.stopPropagation()}>
                <div className = "modal-header">
                    <h2>{title}</h2>
                    <button className = "btn-icon" onClick = {onClose} aria-label = "Close">
                        <CrossIcon size = {20} />
                    </button>
                </div>
                <div className = "modal-body">{children}</div>
            </div>
        </div>
    )
}