import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login           from './pages/Login'
import Dashboard       from './pages/Dashboard'
import CreateJob       from './pages/CreateJob'
import UploadCV        from './pages/UploadCV'
import Rankings        from './pages/Rankings'
import CandidateDetail from './pages/CandidateDetail'
import BiasReport      from './pages/BiasReport'

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to='/' />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/'                    element={<Login />} />
        <Route path='/dashboard'           element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path='/create-job'          element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
        <Route path='/upload/:jobId'       element={<ProtectedRoute><UploadCV /></ProtectedRoute>} />
        <Route path='/rankings/:jobId'     element={<ProtectedRoute><Rankings /></ProtectedRoute>} />
        <Route path='/candidate/:id'       element={<ProtectedRoute><CandidateDetail /></ProtectedRoute>} />
        <Route path='/bias/:jobId'         element={<ProtectedRoute><BiasReport /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App