// src/pages/ActionDetails.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fetchActionById, runAction, deleteAction, updateActionValidation } from '../services/api';

// S3 Client configuration
const s3Client = new S3Client({
  region: process.env.REACT_APP_AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  }
});

export default function ActionDetails() {
  const { actionId } = useParams();
  const navigate = useNavigate();
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [validationForm, setValidationForm] = useState({
    valid: false,
    validation_comments: ''
  });

  const getSignedImageUrl = async (objectKey) => {
    if (!objectKey) return '';
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
        Key: objectKey,
      });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return '';
    }
  };

  useEffect(() => {
    const loadActionAndImages = async () => {
      try {
        const data = await fetchActionById(actionId);
        setAction(data);
        
        // Initialize validation form with current values if they exist
        if (data.validation) {
          setValidationForm({
            valid: data.validation.valid,
            validation_comments: data.validation.validation_comments || ''
          });
        }

        // Generate signed URLs for all images
        const urls = {};
        const imagePaths = {
          screenshot: data.screenshot_path,
          vision: data.google_vision_plot,
          yolo: data.yolo_plot,
          yolo_icons: data.yolo_icons_plot,
          annotated: data.annotated_plot,
        };

        for (const [key, path] of Object.entries(imagePaths)) {
          if (path) {
            urls[key] = await getSignedImageUrl(path);
          }
        }
        setImageUrls(urls);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    loadActionAndImages();
  }, [actionId]);

  const toggleImage = (imageKey) => {
    setExpandedImage(expandedImage === imageKey ? null : imageKey);
  };

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
          src={imageUrls[key]}
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
            href={imageUrls[key]} 
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

  const handleValidationUpdate = async () => {
    try {
      const validationPayload = {
        valid: validationForm.valid,
        validation_comments: validationForm.validation_comments
      };
      console.log('Updating validation for action:', actionId);
      console.log('Validation payload:', validationPayload);
      
      await updateActionValidation(actionId, validationPayload);
      
      // Update local state
      setAction(prev => ({
        ...prev,
        validation: {
          valid: validationForm.valid,
          validation_comments: validationForm.validation_comments
        }
      }));
      alert('Validation updated successfully');
    } catch (err) {
      console.error('Error updating validation:', err);
      alert('Failed to update validation. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this action?')) {
      try {
        await deleteAction(actionId);
        navigate('/actions');
      } catch (err) {
        console.error('Error deleting action:', err);
        alert('Failed to delete action. Please try again.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Action Details</h1>
        <div style={styles.headerButtons}>
          <button 
            onClick={handleRunAction}
            style={styles.runButton}
          >
            Run This Action
          </button>
          <button 
            onClick={handleDelete}
            style={styles.deleteButton}
          >
            Delete Action
          </button>
        </div>
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

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Validation</h3>
          <div style={styles.validationContainer}>
            <div style={styles.validationStatus}>
              <label style={styles.validationLabel}>
                <span>Valid:</span>
                <input
                  type="checkbox"
                  checked={validationForm.valid}
                  onChange={(e) => setValidationForm(prev => ({
                    ...prev,
                    valid: e.target.checked
                  }))}
                  style={styles.checkbox}
                />
              </label>
            </div>
            <div style={styles.validationComments}>
              <label style={styles.validationLabel}>
                <span>Comments:</span>
                <textarea
                  value={validationForm.validation_comments}
                  onChange={(e) => setValidationForm(prev => ({
                    ...prev,
                    validation_comments: e.target.value
                  }))}
                  style={styles.textarea}
                  rows={4}
                  placeholder="Enter validation comments..."
                />
              </label>
            </div>
            <button
              onClick={handleValidationUpdate}
              style={styles.validationButton}
            >
              Update Validation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  validationContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
  },
  validationStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  validationLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    fontSize: '0.9rem',
    color: '#444',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  validationComments: {
    width: '100%',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
    resize: 'vertical',
  },
  validationButton: {
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    alignSelf: 'flex-start',
    transition: 'background-color 0.2s',
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
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
  },
  imageControls: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  }
};
