// src/pages/Tasks.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllTasks } from '../services/api';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllTasks()
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div>
      <h1>All Tasks</h1>
      {tasks.length === 0 && <p>No tasks found.</p>}

      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <Link to={`/tasks/${task.task_id}`}>
              {task.task_id} - {task.task || 'Untitled Task'}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
