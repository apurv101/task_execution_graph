// src/pages/Instructions.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllInstructions, deleteInstruction } from '../services/api';

export default function Instructions() {
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllInstructions()
      .then((data) => {
        // Sort instructions by created_at in descending order (if available)
        const sortedInstructions = data.sort((a, b) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at) - new Date(a.created_at);
          }
          return 0;
        });
        setInstructions(sortedInstructions);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (instructionId) => {
    if (window.confirm('Are you sure you want to delete this instruction?')) {
      try {
        await deleteInstruction(instructionId);
        setInstructions(instructions.filter(
          instruction => instruction.instruction_id !== instructionId
        ));
      } catch (err) {
        console.error('Error deleting instruction:', err);
        alert('Failed to delete instruction. Please try again.');
      }
    }
  };

  if (loading) return <p style={styles.loading}>Loading instructions...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>All Instructions</h1>
      </div>

      <div style={styles.card}>
        {instructions.length === 0 ? (
          <p style={styles.text}>No instructions found.</p>
        ) : (
          <div style={styles.instructionList}>
            {instructions.map((instr) => (
              <div key={instr._id} style={styles.instructionItem}>
                <div style={styles.instructionHeader}>
                  <div>
                    <h3 style={styles.instructionId}>
                      Instruction ID: {instr.instruction_id}
                    </h3>
                    <p style={styles.taskId}>
                      Task ID: {instr.task_id || 'N/A'}
                    </p>
                    <div style={styles.timestamps}>
                      {instr.created_at && (
                        <p style={styles.timestamp}>
                          Created: {new Date(instr.created_at).toLocaleString()}
                        </p>
                      )}
                      <p style={styles.timestamp}>
                        Started: {instr.start_time 
                          ? new Date(instr.start_time).toLocaleString() 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div style={styles.actionButtons}>
                    <Link
                      to={`/instructions/${instr.instruction_id}`}
                      style={styles.viewButton}
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDelete(instr.instruction_id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div style={styles.instructionContent}>
                  <p style={styles.instructionDescription}>
                    {instr.instruction || 'No description available'}
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
  instructionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  instructionItem: {
    borderBottom: '1px solid #eee',
    paddingBottom: '20px',
  },
  instructionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  instructionId: {
    fontSize: '1.1rem',
    color: '#444',
    margin: 0,
    marginBottom: '4px',
  },
  taskId: {
    fontSize: '1rem',
    color: '#666',
    margin: '4px 0',
  },
  timestamps: {
    marginTop: '8px',
  },
  instructionContent: {
    marginTop: '10px',
  },
  instructionDescription: {
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
};
