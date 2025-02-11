import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllTasks } from '../services/api';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllTasks()
      .then((data) => {
        // Sort tasks by created_at in descending order (latest first)
        const sortedTasks = data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setTasks(sortedTasks);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={styles.loading}>Loading tasks...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>All Tasks</h1>
      </div>

      <div style={styles.card}>
        {tasks.length === 0 ? (
          <p style={styles.text}>No tasks found.</p>
        ) : (
          <div style={styles.taskList}>
            {tasks.map((task) => (
              <div key={task.task_id} style={styles.taskItem}>
                <div style={styles.taskHeader}>
                  <div>
                    <h3 style={styles.taskId}>Task ID: {task.task_id}</h3>
                    <p style={styles.timestamp}>
                      Created: {new Date(task.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    to={`/tasks/${task.task_id}`}
                    style={styles.viewButton}
                  >
                    View Details
                  </Link>
                </div>
                <div style={styles.taskContent}>
                  <p style={styles.taskDescription}>
                    {task.task || 'No description available'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    color: '#2c3e50',
    margin: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '20px',
    marginBottom: '30px',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  taskItem: {
    borderBottom: '1px solid #eee',
    paddingBottom: '20px',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  taskId: {
    fontSize: '1.1rem',
    color: '#444',
    margin: 0,
  },
  taskContent: {
    marginTop: '10px',
  },
  taskDescription: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: '1.5',
    margin: 0,
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.1rem',
    color: '#666',
    marginTop: '40px',
  },
  text: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: '1.5',
  },
  timestamp: {
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '4px',
  },
  viewButton: {
    textDecoration: 'none',
    backgroundColor: '#2196f3',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s',
  },
};
