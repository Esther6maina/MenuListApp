import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import MenuList from './pages/MenuList';
import Hydration from './pages/Hydration';
import Fitness from './pages/Fitness';
import Calories from './pages/Calories';
import Fasting from './pages/Fasting';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div>
      <Header />
      <ErrorBoundary>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route
            path="/menulist"
            element={
              <ProtectedRoute>
                <MenuList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hydration"
            element={
              <ProtectedRoute>
                <Hydration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fitness"
            element={
              <ProtectedRoute>
                <Fitness />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calories"
            element={
              <ProtectedRoute>
                <Calories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fasting"
            element={
              <ProtectedRoute>
                <Fasting />
              </ProtectedRoute>
            }
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;