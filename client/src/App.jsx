import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Upload from './pages/Upload';
import Subscriptions from './pages/Subscriptions';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <div className="main-content">
            <Sidebar />
            <div className="content-area">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/feed" element={<Subscriptions />} />
                <Route path="/watch/:id" element={<Watch />} />
                <Route path="/upload" element={<Upload />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
