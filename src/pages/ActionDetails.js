// src/pages/ActionDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchActionById, runAction } from '../services/api';

export default function ActionDetails() {
  const { actionId } = useParams();
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);

  const getImageUrl = (absolutePath) => {
    if (!absolutePath) return '';
    return `/api/image-path/${encodeURIComponent(absolutePath)}`;
  };

  const getImageUrlForNewTab = (absolutePath) => {
    if (!absolutePath) return '';
    return `http://localhost:3005/api/image-path/${encodeURIComponent(absolutePath)}`;
  };

  const toggleImage = (imageKey) => {
    setExpandedImage(expandedImage === imageKey ? null : imageKey);
  };

  useEffect(() => {
    fetchActionById(actionId)
      .then((data) => {
        setAction(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [actionId]);

  const handleRunAction = () => {
    runAction(actionId).then(() => {
      alert('Action run triggered (placeholder).');
      // Possibly refetch or update state
    });
  };

  const togglePrompt = () => {
    setIsPromptExpanded((prev) => !prev);
  };

  const renderImage = (path, alt, key) => {
    if (!path) return null;
    const isExpanded = expandedImage === key;
    
    const formatImageTitle = (key) => {
      switch(key) {
        case 'screenshot': return 'Screenshot';
        case 'vision': return 'Google Vision Analysis';
        case 'yolo': return 'YOLO Detection';
        case 'yolo_icons': return 'YOLO Icons';
        case 'annotated': return 'Annotated View';
        default: return key;
      }
    };
    
    return (
      <div style={styles.imageContainer}>
        <h4 style={styles.imageTitle}>{formatImageTitle(key)}</h4>
        <img
          src={getImageUrl(path)}
          alt={alt}
          style={{
            ...styles.image,
            ...(isExpanded && styles.expandedImage)
          }}
          onClick={() => toggleImage(key)}
        />
        <div style={styles.imageControls}>
          <button 
            onClick={() => toggleImage(key)}
            style={styles.controlButton}
          >
            {isExpanded ? 'Shrink' : 'Expand'}
          </button>
          <a 
            href={getImageUrlForNewTab(path)} 
            target="_blank" 
            rel="noreferrer"
            style={styles.linkButton}
          >
            Open in New Tab
          </a>
        </div>
      </div>
    );
  };

  if (loading) return <p style={styles.text}>Loading Action...</p>;
  if (!action) return <p style={styles.text}>No action found with ID {actionId}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Action Details</h1>
        <button 
          onClick={handleRunAction}
          style={styles.runButton}
        >
          Run This Action
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.subtitle}>Action ID: {action.action_id}</h2>
          <span style={{
            ...styles.status,
            backgroundColor: action.status === 'completed' ? '#e0f2e9' : '#fff3e0'
          }}>
            Status: {action.status || 'N/A'}
          </span>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Task</h3>
          <p style={styles.text}>{action.task || 'N/A'}</p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Prompt</h3>
          <pre style={styles.promptBox}>
            <code>
              {isPromptExpanded
                ? action.prompt || 'N/A'
                : (action.prompt?.slice(0, 100) || 'N/A') + 
                  (action.prompt?.length > 100 ? '...' : '')}
            </code>
          </pre>
          {action.prompt && action.prompt.length > 100 && (
            <button 
              onClick={togglePrompt}
              style={styles.controlButton}
            >
              {isPromptExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Timing</h3>
          <p style={styles.text}>
            <strong>Start Time:</strong>{' '}
            {action.start_time ? new Date(action.start_time).toLocaleString() : 'N/A'}
          </p>
          <p style={styles.text}>
            <strong>End Time:</strong>{' '}
            {action.end_time ? new Date(action.end_time).toLocaleString() : 'In Progress'}
          </p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Analysis Results</h3>
          <div style={styles.imageGrid}>
            {renderImage(action.screenshot_path, "Screenshot", "screenshot")}
            {renderImage(action.google_vision_plot, "Google Vision Plot", "vision")}
            {renderImage(action.yolo_plot, "YOLO Plot", "yolo")}
            {renderImage(action.yolo_icons_plot, "YOLO Icons Plot", "yolo_icons")}
            {renderImage(action.annotated_plot, "Annotated Plot", "annotated")}
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>LLM Output</h3>
          <pre style={styles.codeBox}>
            {JSON.stringify(action.llm_output, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

const styles = {
  // ...reuse the same base styles as InstructionDetails...
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    margin: '20px 0',
  },
  image: {
    width: '100%',
    maxWidth: '300px',
    cursor: 'pointer',
    border: '1px solid #ddd',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
  },
  expandedImage: {
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
  imageContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  imageTitle: {
    fontSize: '1.1rem',
    color: '#444',
    marginBottom: '15px',
    textAlign: 'center',
  }
};
