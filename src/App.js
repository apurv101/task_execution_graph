// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import NavBar from './components/NavBar';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import Instructions from './pages/Instructions';
import InstructionDetails from './pages/InstructionDetails';
import Actions from './pages/Actions';
import ActionDetails from './pages/ActionDetails';

function App() {
  return (
    <Router>
      <NavBar />
      <div style={{ margin: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/instructions/:instructionId" element={<InstructionDetails />} />
          <Route path="/actions" element={<Actions />} />
          <Route path="/actions/:actionId" element={<ActionDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
