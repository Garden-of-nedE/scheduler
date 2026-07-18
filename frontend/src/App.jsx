import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

function PrivateRoute({ children }) {
  const {user, loading } = useAuth()
  if (loading) return <div>Loading ...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path = "/login" element = {<div>Login page here</div>} />
      <Route path = "/register" element = {<div>Register page here</div>} />
      <Route
        path = "/"
        element = {
          <PrivateRoute>
            <div>Dashboard here</div>
          </PrivateRoute>
        }
      />
      <Route path = "*" element = {<Navigate to ="/" replace />} />
    </Routes>
  )
}