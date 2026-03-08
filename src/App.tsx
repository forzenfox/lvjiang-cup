import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStream from './pages/admin/Stream';
import AdminTeams from './pages/admin/Teams';
import AdminSchedule from './pages/admin/Schedule';
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminLogin />} />
        
        {/* Protected Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/stream" element={
          <ProtectedRoute>
            <AdminStream />
          </ProtectedRoute>
        } />
        <Route path="/admin/teams" element={
          <ProtectedRoute>
            <AdminTeams />
          </ProtectedRoute>
        } />
        <Route path="/admin/schedule" element={
          <ProtectedRoute>
            <AdminSchedule />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
