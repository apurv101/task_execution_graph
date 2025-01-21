// src/components/ActionCard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Renders a single Action as a "card" with some preview info.
 * Expects an object 'action' with fields like:
 *   - action_id
 *   - status
 *   - screenshot_path
 *   - google_vision_plot
 *   - yolo_plot
 *   - yolo_icons_plot
 *   - annotated_plot
 *
 * The 'showDetailsLink' prop determines whether we link to the Action details page.
 */
export default function ActionCard({ action, showDetailsLink = true }) {
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

  if (!action) return null;

  const renderImage = (path, alt, key) => {
    if (!path) return null;
    const isExpanded = expandedImage === key;
    
    // Format the image title to be more readable
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
        <div style={styles.imageTitle}>{formatImageTitle(key)}</div>
        <img
          src={getImageUrl(path)}
          alt={alt}
          style={{
            ...styles.thumbnail,
            ...(isExpanded && styles.expandedImage)
          }}
          onClick={() => toggleImage(key)}
        />
        <div style={styles.imageControls}>
          <button style={styles.button} onClick={() => toggleImage(key)}>
            {isExpanded ? 'Shrink' : 'Expand'}
          </button>
          <a
            href={getImageUrlForNewTab(path)}
            target="_blank"
            rel="noreferrer"
            style={styles.newTabLink}
          >
            Open in New Tab
          </a>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Action: {action.action_id}</h3>
        <span style={{
          ...styles.status,
          backgroundColor: action.status === 'completed' ? '#e0f2e9' : '#fff3e0'
        }}>
          Status: {action.status || 'N/A'}
        </span>
      </div>

      <div style={styles.imageRow}>
        {renderImage(action.screenshot_path, "Screenshot", "screenshot")}
        {renderImage(action.google_vision_plot, "Google Vision Plot", "vision")}
        {renderImage(action.yolo_plot, "YOLO Plot", "yolo")}
        {renderImage(action.yolo_icons_plot, "YOLO Icons Plot", "yolo_icons")}
        {renderImage(action.annotated_plot, "Annotated Plot", "annotated")}
      </div>

      {showDetailsLink && (
        <div style={styles.footer}>
          <Link to={`/actions/${action.action_id}`} style={styles.detailsLink}>
            View Full Action Details →
          </Link>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #eaeaea',
    margin: '15px 0',
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  imageRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    flexDirection: 'row',
  },
  thumbnail: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    border: '1px solid #eee',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
    },
  },
  expandedImage: {
    width: 'auto',         // Changed from 100%
    height: 'auto',
    maxWidth: '90vw',      // Changed from 800px
    maxHeight: '80vh',     // Changed from 600px
    objectFit: 'contain',
    position: 'fixed',     // Add this
    top: '50%',           // Add this
    left: '50%',          // Add this
    transform: 'translate(-50%, -50%)', // Add this
    zIndex: 1000,         // Add this
    backgroundColor: '#fff', // Add this
    boxShadow: '0 0 20px rgba(0,0,0,0.3)', // Add this
  },
  imageContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    margin: '10px',
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  imageControls: {
    display: 'flex',
    gap: '10px',
    marginTop: '5px',
  },
  newTabLink: {
    textDecoration: 'none',
    color: '#0066cc',
    fontSize: '14px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  title: {
    margin: 0,
    fontSize: '1.2rem',
    color: '#2c3e50',
  },
  status: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  imageTitle: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#666',
    marginBottom: '5px',
    textAlign: 'center',
  },
  button: {
    padding: '4px 8px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#e0e0e0',
    },
  },
  footer: {
    marginTop: '15px',
    textAlign: 'right',
    borderTop: '1px solid #eee',
    paddingTop: '10px',
  },
  detailsLink: {
    textDecoration: 'none',
    color: '#2196f3',
    fontSize: '0.9rem',
    fontWeight: '500',
    ':hover': {
      textDecoration: 'underline',
    },
  }
};
