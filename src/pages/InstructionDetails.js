import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchInstructionById,
  runInstruction,
  fetchActionsByInstructionId, 
} from '../services/api';
import ActionCard from '../components/ActionCard';

export default function InstructionDetails() {
  const { instructionId } = useParams();
  const [instruction, setInstruction] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for actions
  const [actions, setActions] = useState([]);
  const [actionsLoading, setActionsLoading] = useState(true);

  // State for prompt expansion
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);

  // State for screenshot expansion
  const [isScreenshotExpanded, setIsScreenshotExpanded] = useState(false);

  const getImageUrl = (absolutePath) => {
    if (!absolutePath) return '';
    // Encode the absolute path for use in the URL
    return `/api/image-path/${encodeURIComponent(absolutePath)}`;
  };

  const getImageUrlForNewTab = (absolutePath) => {
    if (!absolutePath) return '';
    // Use the full URL with the proxy port for direct navigation
    return `http://localhost:3005/api/image-path/${encodeURIComponent(absolutePath)}`;
  };

  useEffect(() => {
    fetchInstructionById(instructionId)
      .then((data) => {
        setInstruction(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
      fetchActionsByInstructionId(instructionId)
      .then((actionData) => {
        setActions(actionData);
        setActionsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setActionsLoading(false);
      });
  }, [instructionId]);

  const handleRunInstruction = () => {
    runInstruction(instructionId).then(() => {
      alert('Instruction run triggered (placeholder).');
    });
  };

  const togglePrompt = () => {
    setIsPromptExpanded((prev) => !prev);
  };

  const toggleScreenshot = () => {
    setIsScreenshotExpanded((prev) => !prev);
  };

  if (loading) return <p>Loading Instruction...</p>;
  if (!instruction) return <p>No instruction found with ID {instructionId}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Instruction Details</h1>
        <button 
          onClick={handleRunInstruction}
          style={styles.runButton}
        >
          Run This Instruction
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.subtitle}>ID: {instruction.instruction_id}</h2>
          <span style={{
            ...styles.status,
            backgroundColor: instruction.status === 'completed' ? '#e0f2e9' : '#fff3e0'
          }}>
            Status: {instruction.status || 'N/A'}
          </span>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Instruction</h3>
          <p style={styles.text}>{instruction.instruction || 'N/A'}</p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Prompt</h3>
          <pre style={styles.promptBox}>
            <code>
              {isPromptExpanded
                ? instruction.prompt || 'N/A'
                : (instruction.prompt?.slice(0, 100) || 'N/A') + 
                  (instruction.prompt?.length > 100 ? '...' : '')}
            </code>
          </pre>
          {instruction.prompt && instruction.prompt.length > 100 && (
            <button 
              onClick={togglePrompt} 
              style={styles.controlButton}
            >
              {isPromptExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Generated Instruction</h3>
          <pre style={styles.codeBox}>
            {JSON.stringify(instruction.generated_instruction, null, 2)}
          </pre>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Timing</h3>
          <p style={styles.text}>
            <strong>Start Time:</strong>{' '}
            {instruction.start_time 
              ? new Date(instruction.start_time).toLocaleString() 
              : 'N/A'}
          </p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Screenshot</h3>
          {instruction.screenshot_path ? (
            <div style={styles.screenshotContainer}>
              <img
                src={getImageUrl(instruction.screenshot_path)}
                alt="Instruction screenshot"
                style={{
                  ...styles.screenshot,
                  ...(isScreenshotExpanded && styles.expandedScreenshot)
                }}
                onClick={toggleScreenshot}
              />
              <div style={styles.imageControls}>
                <button 
                  onClick={toggleScreenshot}
                  style={styles.controlButton}
                >
                  {isScreenshotExpanded ? 'Shrink Image' : 'Expand Image'}
                </button>
                <a 
                  href={getImageUrlForNewTab(instruction.screenshot_path)} 
                  target="_blank" 
                  rel="noreferrer"
                  style={styles.linkButton}
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          ) : (
            <p style={styles.text}>No screenshot available</p>
          )}
        </div>
      </div>

      <div style={styles.actionsSection}>
        <h2 style={styles.subtitle}>Actions in this Instruction</h2>
        {actionsLoading ? (
          <p style={styles.text}>Loading actions...</p>
        ) : actions && actions.length > 0 ? (
          actions.map((action) => (
            <ActionCard key={action.action_id} action={action} />
          ))
        ) : (
          <p style={styles.text}>No actions found for this instruction.</p>
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
  promptBox: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '6px',
    overflow: 'auto',
    fontSize: '0.9rem',
    maxHeight: '300px',
  },
  codeBox: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '6px',
    overflow: 'auto',
    fontSize: '0.9rem',
  },
  screenshotContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  screenshot: {
    maxWidth: '300px',
    cursor: 'pointer',
    border: '1px solid #ddd',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
  },
  expandedScreenshot: {
    width: 'auto',
    height: 'auto',
    maxWidth: '90vw',
    maxHeight: '80vh',
    objectFit: 'contain',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    backgroundColor: '#fff',
    boxShadow: '0 0 20px rgba(0,0,0,0.3)',
  },
  imageControls: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
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
  controlButton: {
    padding: '6px 12px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s',
  },
  linkButton: {
    textDecoration: 'none',
    color: '#2196f3',
    fontSize: '0.9rem',
    padding: '6px 12px',
  },
  actionsSection: {
    marginTop: '40px',
  }
};
