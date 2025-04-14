import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Ensure Routes is imported
import Header from './components/Header';
import Home from './pages/Home';
import MenuList from './pages/MenuList';
import Hydration from './pages/Hydration';
import Fitness from './pages/Fitness';
import Calories from './pages/Calories';
import Fasting from './pages/Fasting';
import AddFood from './pages/AddFood';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <div className="dashboard">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/menulist" element={<MenuList />} />
            <Route path="/hydration" element={<Hydration />} />
            <Route path="/fitness" element={<Fitness />} />
            <Route path="/calories" element={<Calories />} />
            <Route path="/fasting" element={<Fasting />} />
            <Route path="/add-food" element={<AddFood />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;