import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  fetchInstructionById,
  runInstruction,
  fetchActionsByInstructionId,
  deleteInstruction,
  updateInstructionValidation,
} from '../services/api';
import ActionCard from '../components/ActionCard';

// Debug environment variables
console.log('Environment Variables:', {
  region: process.env.REACT_APP_AWS_REGION,
  bucket: process.env.REACT_APP_S3_BUCKET_NAME,
});

// Validate required environment variables
const REGION = process.env.REACT_APP_AWS_REGION;
const BUCKET_NAME = process.env.REACT_APP_S3_BUCKET_NAME;
const ACCESS_KEY = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;

if (!REGION || !BUCKET_NAME || !ACCESS_KEY || !SECRET_KEY) {
  console.error('Missing required AWS environment variables.');
}

// S3 Client configuration with credentials
const s3Client = new S3Client({
  region: REGION || 'us-east-2',
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  }
});

export default function InstructionDetails() {
  const { instructionId } = useParams();
  const navigate = useNavigate();
  const [instruction, setInstruction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [actions, setActions] = useState([]);
  const [actionsLoading, setActionsLoading] = useState(true);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [isScreenshotExpanded, setIsScreenshotExpanded] = useState(false);
  const [validationForm, setValidationForm] = useState({
    valid: false,
    validation_comments: ''
  });

  const getSignedImageUrl = async (objectKey) => {
    if (!objectKey || !BUCKET_NAME) return '';
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
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
    const loadInstructionAndImage = async () => {
      try {
        const data = await fetchInstructionById(instructionId);
        setInstruction(data);
        if (data.screenshot_path) {
          const url = await getSignedImageUrl(data.screenshot_path);
          setScreenshotUrl(url);
        }
        // Initialize validation form with current values if they exist
        if (data.validation) {
          setValidationForm({
            valid: data.validation.valid,
            validation_comments: data.validation.validation_comments || ''
          });
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    loadInstructionAndImage();

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

  const handleValidationUpdate = async () => {
    try {
      const validationPayload = {
        valid: validationForm.valid,
        validation_comments: validationForm.validation_comments
      };
      
      await updateInstructionValidation(instructionId, validationPayload);
      
      // Update local state
      setInstruction(prev => ({
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

  const handleRunInstruction = () => {
    runInstruction(instructionId).then(() => {
      alert('Instruction run triggered (placeholder).');
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this instruction?')) {
      try {
        await deleteInstruction(instructionId);
        navigate('/instructions');
      } catch (err) {
        console.error('Error deleting instruction:', err);
        alert('Failed to delete instruction. Please try again.');
      }
    }
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
        <div style={styles.headerButtons}>
          <button 
            onClick={handleRunInstruction}
            style={styles.runButton}
          >
            Run This Instruction
          </button>
          <button 
            onClick={handleDelete}
            style={styles.deleteButton}
          >
            Delete Instruction
          </button>
        </div>
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
                src={screenshotUrl}
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
                  href={screenshotUrl} 
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

      <div style={styles.card}>
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
  headerButtons: {
    display: 'flex',
    gap: '10px',
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
