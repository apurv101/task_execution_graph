// src/pages/Actions.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllActions, deleteAction } from '../services/api';

export default function Actions() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllActions()
      .then((data) => {
        // Sort actions by start_time in descending order (newest first)
        const sortedActions = data.sort((a, b) => {
          if (a.start_time && b.start_time) {
            return new Date(b.start_time) - new Date(a.start_time);
          }
          return 0;
        });
        setActions(sortedActions);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (actionId) => {
    if (window.confirm('Are you sure you want to delete this action?')) {
      try {
        await deleteAction(actionId);
        setActions(actions.filter(action => action.action_id !== actionId));
      } catch (err) {
        console.error('Error deleting action:', err);
        alert('Failed to delete action. Please try again.');
      }
    }
  };

  if (loading) return <p style={styles.loading}>Loading actions...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>All Actions</h1>
      </div>

      <div style={styles.card}>
        {actions.length === 0 ? (
          <p style={styles.text}>No actions found.</p>
        ) : (
          <div style={styles.actionList}>
            {actions.map((action) => (
              <div key={action._id} style={styles.actionItem}>
                <div style={styles.actionHeader}>
                  <div>
                    <h3 style={styles.actionId}>
                      Action ID: {action.action_id}
                    </h3>
                    <p style={styles.instructionId}>
                      Instruction ID: {action.instruction_id || 'N/A'}
                    </p>
                    <div style={styles.metadata}>
                      <p style={styles.status}>
                        Status: {action.status || 'N/A'}
                      </p>
                      <p style={styles.timestamp}>
                        Started: {action.start_time 
                          ? new Date(action.start_time).toLocaleString() 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div style={styles.actionButtons}>
                    <Link
                      to={`/actions/${action.action_id}`}
                      style={styles.viewButton}
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDelete(action.action_id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div style={styles.actionContent}>
                  <p style={styles.actionDescription}>
                    {action.task || 'No description available'}
                  </p>
                  {action.notes && (
                    <p style={styles.notes}>
                      Notes: {action.notes}
                    </p>
                  )}
                  {action.screenshot_path && (
                    <div style={styles.screenshotInfo}>
                      <span style={styles.iconText}>📸 Screenshot available</span>
                    </div>
                  )}
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
  actionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  actionItem: {
    borderBottom: '1px solid #eee',
    paddingBottom: '20px',
  },
  actionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  actionId: {
    fontSize: '1.1rem',
    color: '#444',
    margin: 0,
    marginBottom: '4px',
  },
  instructionId: {
    fontSize: '1rem',
    color: '#666',
    margin: '4px 0',
  },
  metadata: {
    marginTop: '8px',
  },
  actionContent: {
    marginTop: '10px',
  },
  actionDescription: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: '1.5',
    margin: '0 0 8px 0',
  },
  notes: {
    fontSize: '0.9rem',
    color: '#666',
    fontStyle: 'italic',
    margin: '8px 0',
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
  status: {
    fontSize: '0.9rem',
    color: '#666',
    margin: '2px 0',
  },
  timestamp: {
    fontSize: '0.9rem',
    color: '#666',
    margin: '2px 0',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
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
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s',
  },
  screenshotInfo: {
    marginTop: '8px',
  },
  iconText: {
    fontSize: '0.9rem',
    color: '#666',
  },
};
