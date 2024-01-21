// App.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import './App.css';
import TaskPage from './components/TaskPage';
import AllUsers from './components/AllUsers';
import UserDetail from './components/UserDetail';
import MyUsers from './components/MyUsers';

const App = () => {
  return (
    <div className='pozadina'>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/tasks" element={<TaskPage />} />
        <Route path="/korisnici" element={<AllUsers />} />
        <Route path="/korisnici/:id" element={<UserDetail />} />
        <Route path="/mojikorisnici" element={<MyUsers />} />
    </Routes>
    </div>
    
  );
};

export default App;
