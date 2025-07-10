import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './components/Login';
import Main from './components/Main';
import CreatePost from './components/CreatePost';
import Post from './components/Post';
import EditPost from './components/EditPost';
import UserProfile from './components/UserProfile';

const PrivateRoute = ({ children }) => {
  const nickname = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');
  return nickname ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Main /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
          <Route path="/post/:id" element={<PrivateRoute><Post /></PrivateRoute>} />
          <Route path="/edit/:id" element={<PrivateRoute><EditPost /></PrivateRoute>} />
          <Route path="/user/:nickname" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
