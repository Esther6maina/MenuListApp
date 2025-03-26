import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
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
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/menulist" component={MenuList} />
            <Route path="/hydration" component={Hydration} />
            <Route path="/fitness" component={Fitness} />
            <Route path="/calories" component={Calories} />
            <Route path="/fasting" component={Fasting} />
            <Route path="/add-food" component={AddFood} />
            <Route path="/signup" component={SignUp} />
            <Route path="/login" component={Login} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;