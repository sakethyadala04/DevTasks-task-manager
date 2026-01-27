import { Navigate, useNavigate, Routes, Route, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout.jsx';

import Navbar from './components/Navbar.jsx';
import Login from './components/Login.jsx';
import SignUp from './components/SignUp.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PendingPages from './pages/PendingPages.jsx';
import CompletedPages from './pages/CompletedPages.jsx';
import Profile from './components/Profile.jsx';

const App = () => {

  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
    else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

const handleAuthSubmit = ({ user, token }) => {
  if (token) localStorage.setItem("token", token);

  // if (user && user.id) {
  //   localStorage.setItem("userId", user.id)
  // }

setCurrentUser({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
});

  navigate("/", { replace: true });
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("userId");  
  setCurrentUser(null);
  console.log("Logout clicked");
  navigate('/login', { replace: true });
};

const ProtectedLayout = () => {
  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      <Outlet />
    </Layout>
  );
}

return (
  <Routes>
    <Route path='/login' element={<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
      <Login onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/signup')} />
    </div>} />

    <Route path='/signup' element={<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
      <SignUp onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/login')} />
    </div>} />

    <Route element={currentUser ? <ProtectedLayout /> :
      <Navigate to="/login" replace />} >

      <Route path='/' element={<Dashboard />} />
      <Route path='/pending' element={<PendingPages />} />
      <Route path='/complete' element={<CompletedPages />} />
      <Route path='/profile' element={<Profile user={currentUser}  setCurrentUser={setCurrentUser} onLogout={handleLogout} />} />
    </Route>


    <Route path='*' element={<Navigate to={currentUser ? "/" : "/login"} replace />} />
  </Routes>
);
}

export default App;
