import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MatchDataPage from './components/features/match-data/MatchDataPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/s2" element={<Home />} />
        <Route path="/s2/match/:id/games" element={<MatchDataPage />} />
      </Routes>
    </Router>
  );
}

export default App;
