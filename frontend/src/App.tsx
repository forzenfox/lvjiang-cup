import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStream from './pages/admin/Stream';
import AdminTeams from './pages/admin/Teams';
import AdminSchedule from './pages/admin/Schedule';
import AdminStreamers from './pages/admin/Streamers';
import Videos from './pages/admin/Videos';
// [REMOVE] 晋级名单管理页面已废弃
// import AdvancementManager from './pages/admin/AdvancementManager';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MatchDataPage from './components/features/match-data/MatchDataPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/match/:id/games" element={<MatchDataPage />} />

        {/* Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stream"
          element={
            <ProtectedRoute>
              <AdminStream />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teams"
          element={
            <ProtectedRoute>
              <AdminTeams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedule"
          element={
            <ProtectedRoute>
              <AdminSchedule />
            </ProtectedRoute>
          }
        />
        {/* [REMOVE] 晋级名单管理页面已废弃
        <Route path="/admin/advancement" element={
          <ProtectedRoute>
            <AdvancementManager />
          </ProtectedRoute>
        } />
        */}
        <Route
          path="/admin/streamers"
          element={
            <ProtectedRoute>
              <AdminStreamers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/videos"
          element={
            <ProtectedRoute>
              <Videos />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
