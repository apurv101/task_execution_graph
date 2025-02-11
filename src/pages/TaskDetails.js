// src/pages/TaskDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchTaskById,
  runTask,
  fetchInstructionsByTaskId, 
} from '../services/api';
import InstructionCard from '../components/InstructionCard';

export default function TaskDetails() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [instructions, setInstructions] = useState([]);
  const [instructionsLoading, setInstructionsLoading] = useState(true);

  useEffect(() => {
    fetchTaskById(taskId)
      .then((data) => {
        setTask(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    
    fetchInstructionsByTaskId(taskId)
      .then((data) => {
        setInstructions(data);
        setInstructionsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setInstructionsLoading(false);
      });
  }, [taskId]);

  const handleRunTask = () => {
    runTask(taskId).then(() => {
      alert('Task run triggered (placeholder).');
      // Possibly refetch data
    });
  };

  if (loading) return <p style={styles.text}>Loading Task Details...</p>;
  if (!task) return <p style={styles.text}>No task found with ID: {taskId}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Task Details</h1>
        <button 
          onClick={handleRunTask}
          style={styles.runButton}
        >
          Run This Task
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.subtitle}>ID: {task.task_id}</h2>
          <span style={{
            ...styles.status,
            backgroundColor: task.status === 'completed' ? '#e0f2e9' : '#fff3e0'
          }}>
            Status: {task.status || 'N/A'}
          </span>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Task Name</h3>
          <p style={styles.text}>{task.task || 'No title'}</p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Timing</h3>
          <p style={styles.text}>
            <strong>Start Time:</strong>{' '}
            {task.start_time 
              ? new Date(task.start_time).toLocaleString() 
              : 'N/A'}
          </p>
        </div>
      </div>

      <div style={styles.instructionsSection}>
        <h2 style={styles.subtitle}>Instructions for this Task</h2>
        {instructionsLoading ? (
          <p style={styles.text}>Loading instructions...</p>
        ) : instructions.length > 0 ? (
          instructions.map((instr) => (
            <InstructionCard key={instr.instruction_id} instruction={instr} />
          ))
        ) : (
          <p style={styles.text}>No instructions found for this task.</p>
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
  subtitle: {
    fontSize: '1.5rem',
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
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  section: {
    marginBottom: '25px',
    borderBottom: '1px solid #eee',
    paddingBottom: '20px',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    color: '#444',
    marginBottom: '10px',
  },
  text: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: '1.5',
  },
  status: {
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  runButton: {
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  instructionsSection: {
    marginTop: '40px',
  }
};
