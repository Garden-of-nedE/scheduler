import React from 'react'

export default function Modal({ title, onClose, children }) {
    return (
        <div
            style = {{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick = {onClose}
        >
            <div
                style = {{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '24px',
                    minWidth: '320px',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
                onClick = {(e) => e.stopPropagation()}
            >
                <div style = {{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
                    <h2>{title}</h2>
                    <button onClick = {onClose} aria-label = "Close">x</button>
                </div>
                {children}
            </div>
        </div>
    )
}