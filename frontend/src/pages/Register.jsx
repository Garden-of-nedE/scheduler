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
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            await register(email, password, fullName)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.detail || 'Could not register. Check your details & try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <h1>Register</h1>

            {error && <p style = {{ color: 'red' }}>{error}</p>}

            <form onSubmit = {handleSubmit}>
                <div>
                    <label>Full Name</label>
                    <input
                        type = "text"
                        value = {fullName}
                        onChange = {(e) => setFullName(e.target.value)}
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input
                        type = "email"
                        required
                        value = {email}
                        onChange = {(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type = "password"
                        required
                        value = {password}
                        onChange = {(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type = "submit" disabled = {submitting}>
                    {submitting ? 'Signing up ...' : 'Sign in'}
                </button>
            </form>

            <p>
                Exisiting user? <Link to = "/login"> Login here</Link>
            </p>
        </div>
    )
}