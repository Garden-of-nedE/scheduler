import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            await login(email, password)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.detail || 'Could not sign in. Check your details & try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <h1>Sign In</h1>

            {error && <p style = {{ color: 'red' }}>{error}</p>}

            <form onSubmit = {handleSubmit}>
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
                    {submitting ? 'Signing in ...' : 'Sign in'}
                </button>
            </form>

            <p>
                New here? <Link to = "/register">Create an account</Link>
            </p>
        </div>
    )
}