import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Profile from './pages/Profile';
import './index.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token');
    if (token) {
      // Recover user info if possible
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Fallback if local storage cleared but token remains (edge case)
        // In real app, fetch /api/me
        setUser({ username: 'User' });
      }
    }
  }, []);

  const handleSetUser = (u) => {
    setUser(u);
    if (u) {
      localStorage.setItem('user', JSON.stringify(u));
    } else {
      localStorage.removeItem('user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="container">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home currentUser={user} />} />
          <Route path="/profile" element={user ? <Profile currentUser={user} setUser={handleSetUser} /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <Login setUser={handleSetUser} /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

function Navbar({ user, onLogout }) {
  return (
    <nav className="glass-panel" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      marginTop: '1rem',
      position: 'sticky',
      top: '1rem',
      zIndex: 100
    }}>
      <Link to="/" style={{
        textDecoration: 'none',
        color: 'var(--accent-color)',
        fontSize: '2rem',
        fontFamily: "'Pacifico', cursive",
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>Homemade</Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'var(--text-primary)', gap: '8px' }}>
              {user.avatar_url && <img src={user.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />}
              <span>{user.username}</span>
            </Link>
            <button className="btn" onClick={onLogout} style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login"><button className="btn" style={{ background: 'transparent' }}>Log In</button></Link>
            <Link to="/signup"><button className="btn">Sign Up</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default App;
