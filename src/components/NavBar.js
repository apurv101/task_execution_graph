// src/components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav style={{ background: '#eee', padding: '10px' }}>
      <Link to="/">Home</Link> |{' '}
      <Link to="/tasks">Tasks</Link> |{' '}
      <Link to="/instructions">Instructions</Link> |{' '}
      <Link to="/actions">Actions</Link>
    </nav>
  );
}
