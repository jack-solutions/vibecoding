import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import RoleRoute from './utils/RoleRoute';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WatchPage from './pages/WatchPage';
import UploadPage from './pages/UploadPage';
import SearchPage from './pages/SearchPage';
import ChannelPage from './pages/ChannelPage';
import CreatorDashboard from './pages/CreatorDashboard';
import AdminDashboard from './pages/AdminDashboard';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="app-body">
            <Sidebar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/watch/:id" element={<WatchPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/channel/:id" element={<ChannelPage />} />
                
                {/* Creator Routes */}
                <Route 
                  path="/upload" 
                  element={
                    <RoleRoute allowedRoles={['Creator']}>
                      <UploadPage />
                    </RoleRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <RoleRoute allowedRoles={['Creator']}>
                      <CreatorDashboard />
                    </RoleRoute>
                  } 
                />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <RoleRoute allowedRoles={['Admin']}>
                      <AdminDashboard />
                    </RoleRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
