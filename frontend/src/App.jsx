import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watch from './pages/Watch';
import ChannelDashboard from './pages/ChannelDashboard';
import UploadVideo from './pages/UploadVideo';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <div className="main-content">
            <Sidebar />
            <div className="page-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/watch/:id" element={<Watch />} />
                <Route path="/channel/:id" element={<ChannelDashboard />} />
                <Route path="/upload" element={<UploadVideo />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
