import React, { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children}) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            setLoading(false)
            return
        }

        client
            .get('/api/auth/me')
            .then((res) => setUser(res.data))
            .catch(() => localStorage.removeItem('token'))
            .finally(() => setLoading(false))
    }, [])

    async function login(email, password) {
        const form = new URLSearchParams()
        form.append('username', email)
        form.append('password', password)
        const res = await client.post('/api/auth/login', form, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })

        localStorage.setItem('token', res.data.access_token)
        const me = await client.get('/api/auth/me')
        setUser(me.data)
    }

    async function register(email, password, fullName) {
        await client.post('/api/auth/register', {
            email,
            password,
            full_name: fullName || null,
        })

        await login(email, password)
    }

    async function refreshUser() {
        const res = await client.get('/api/auth/me')
        setUser(res.data)
    }

    function logout() {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value = {{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}