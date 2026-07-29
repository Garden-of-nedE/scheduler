import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    function validatePassword(password) {
        if (password.length < 8) return 'Password must be at least 8 characters long'
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
        if (!/[a-z]/.test(password)) return 'Password must contatin at least one lowercase letter'
        if (!/[0-9]/.test(password)) return 'Password must contain at lease one number'
        return ''
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        const pwError = validatePassword(password)
        if (pwError) {
            setError(pwError)
            return
        }

        setSubmitting(true)
        try {
            await register(email, password, fullName)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || 'Could not create account.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className = "auth-page">
            <div className = "auth-card">
                <h1>Register</h1>

                {error && <p className = "form-error">{error}</p>}

                <form onSubmit = {handleSubmit}>
                    <div className = "form-field">
                        <label>Full Name</label>
                        <input
                            type = "text"
                            value = {fullName}
                            onChange = {(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div className = "form-field">
                        <label>Email</label>
                        <input
                            type = "email"
                            required
                            value = {email}
                            onChange = {(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className = "form-field">
                        <label>Password</label>
                        <input
                            type = "password"
                            required
                            value = {password}
                            onChange = {(e) => setPassword(e.target.value)}
                        />
                        <small style = {{ color: 'var(--color-text-muted)' }}>
                            At least 8 characters, with uppercase, lowercase and a number.
                        </small>
                    </div>

                    <button type = "submit" className = "btn" style = {{ alignSelf: 'center', display: 'block', margin: '0 auto' }} disabled = {submitting}>
                        {submitting ? 'Signing up ...' : 'Sign in'}
                    </button>
                </form>

                <p>
                    Exisiting user? <Link to = "/login"> Login here</Link>
                </p>
            </div>
        </div>
    )
}