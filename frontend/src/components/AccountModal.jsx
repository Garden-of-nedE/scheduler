import React, { useState } from 'react'
import client from '../api/client'
import Modal from './Modal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { AsteriskIcon, SaveIcon } from './icons/Icons'

export default function  AccountModal({ onClose }) {
    const { user, refreshUser } = useAuth()
    const [fullName, setFullName] = useState(user?.full_name || '')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        try{
            const payload = { full_name: fullName || null}
            if (newPassword) {
                payload.password = newPassword
                payload.current_password = currentPassword
            }
            await client.put('/api/auth/me', payload)
            await refreshUser()
            onClose()
        } catch (err) {
            const detail = err.response?.data?.detail
            console.log(err)
            setError(typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : 'Could not update account.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal title = "My Account" onClose = {onClose}>
            <form onSubmit = {handleSubmit}>
                {error && <p className = "form-error">{error}</p>}

                <div className = "form-field">
                    <label>Username</label>
                    <input value = {fullName} onChange = {(e) => setFullName(e.target.value)}/>
                </div>

                <div className = "form-field">
                    <label>New Password</label>
                    <input type = "password" value = {newPassword} onChange = {(e) => setNewPassword(e.target.value)}/>
                </div>

                {newPassword && (
                    <>
                        <div className = "form-field">
                            <label>Current Password <AsteriskIcon size={10}/></label>
                            <input type = "password" value = {currentPassword} onChange = {(e) => setCurrentPassword(e.target.value)}/> 
                        </div>

                        <div className = "form-field">
                            <label>
                                <AsteriskIcon size={10}/> Required
                            </label>
                        </div>
                    </>
                    
                )}

                <button type = "submit" className = "btn" disabled = {submitting}>
                    <SaveIcon />
                    {submitting ? 'Saving ...' : 'Save changes'}
                </button>
            </form>
        </Modal>
    )
}