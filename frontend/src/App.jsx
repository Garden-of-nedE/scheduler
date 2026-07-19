import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'

function PrivateRoute({ children }) {
  const {user, loading } = useAuth()
  if (loading) return <div>Loading ...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path = "/login" element = {<Login />} />
      <Route path = "/register" element = {<Register />} />
      <Route
        path = "/"
        element = {
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route path = "*" element = {<Navigate to ="/" replace />} />
    </Routes>
  )
}