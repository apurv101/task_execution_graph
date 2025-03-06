import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchInstructionById,
  runInstruction,
  fetchActionsByInstructionId,
  deleteInstruction,
  updateInstructionValidation,
} from '../services/api';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import ActionCard from '../components/ActionCard';

// S3 Client configuration
const s3Client = new S3Client({
  region: process.env.REACT_APP_AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  }
});

export default function InstructionDetails() {
  const { instructionId } = useParams();
  const navigate = useNavigate();
  const [instruction, setInstruction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [actionsLoading, setActionsLoading] = useState(true);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [isScreenshotExpanded, setIsScreenshotExpanded] = useState(false);
  const [validationForm, setValidationForm] = useState({
    valid: false,
    validation_comments: ''
  });
  const [signedUrls, setSignedUrls] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // Get signed URLs for S3 objects
  const getSignedImageUrl = async (objectKey) => {
    if (!objectKey) return '';
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
        Key: objectKey,
      });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      console.log(`Generated signed URL for ${objectKey}`);
      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return '';
    }
  };

  // Generate signed URLs for all images
  const generateAllSignedUrls = async (instructionData) => {
    if (!instructionData?.visual_assets) return;
    
    const urls = {};
    const visualAssets = instructionData.visual_assets;
    
    for (const [key, path] of Object.entries(visualAssets)) {
      if (path) {
        console.log(`Generating signed URL for ${key}: ${path}`);
        urls[key] = await getSignedImageUrl(path);
      }
    }
    
    console.log('Generated signed URLs:', urls);
    setSignedUrls(urls);
  };

  useEffect(() => {
    const loadInstructionAndAssets = async () => {
      try {
        const data = await fetchInstructionById(instructionId);
        setInstruction(data);
        
        // Generate signed URLs for all images
        await generateAllSignedUrls(data);
        
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

    loadInstructionAndAssets();

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

  const handleImageError = (key, path) => {
    console.error(`Failed to load image: ${path}`);
    setImageErrors(prev => ({
      ...prev,
      [key]: true
    }));
  };

  if (loading) return <p style={styles.loading}>Loading Instruction...</p>;
  if (!instruction) return <p style={styles.error}>No instruction found with ID {instructionId}</p>;

  // Define placeholder image from public folder
  const placeholderImage = process.env.PUBLIC_URL + '/logo192.png';

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
          <h3 style={styles.sectionTitle}>Environment</h3>
          <p style={styles.text}>{instruction.environment || 'N/A'}</p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Parent Task</h3>
          <p style={styles.text}>{instruction.parent?.task_id || 'N/A'}</p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Sequence</h3>
          <p style={styles.text}>{instruction.sequence || 'N/A'}</p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Hierarchy Level</h3>
          <p style={styles.text}>{instruction.hierarchy_level || 'N/A'}</p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Data Flow</h3>
          <div style={styles.codeBox}>
            <p><strong>Input:</strong> {instruction.data_flow?.input || 'N/A'}</p>
            <p><strong>Output:</strong> {instruction.data_flow?.output || 'N/A'}</p>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Prompt</h3>
          <pre style={styles.promptBox}>
            <code>
              {isPromptExpanded
                ? instruction.llm_data?.prompt || 'N/A'
                : (instruction.llm_data?.prompt?.slice(0, 100) || 'N/A') + 
                  (instruction.llm_data?.prompt?.length > 100 ? '...' : '')}
            </code>
          </pre>
          {instruction.llm_data?.prompt && instruction.llm_data.prompt.length > 100 && (
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
            {JSON.stringify(instruction.llm_data?.generated_instruction, null, 2)}
          </pre>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Notes</h3>
          <p style={styles.text}>{instruction.notes || 'No notes available'}</p>
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
          {instruction.visual_assets?.screenshot_path ? (
            <div style={styles.screenshotContainer}>
              <img
                src={imageErrors['screenshot'] 
                  ? placeholderImage 
                  : signedUrls['screenshot_path'] || placeholderImage}
                alt="Instruction screenshot"
                style={{
                  ...styles.screenshot,
                  ...(isScreenshotExpanded && styles.expandedScreenshot)
                }}
                onClick={toggleScreenshot}
                onError={() => handleImageError('screenshot', instruction.visual_assets.screenshot_path)}
              />
              <div style={styles.imageControls}>
                <button 
                  onClick={toggleScreenshot}
                  style={styles.controlButton}
                >
                  {isScreenshotExpanded ? 'Shrink Image' : 'Expand Image'}
                </button>
                {signedUrls['screenshot_path'] && (
                  <a 
                    href={signedUrls['screenshot_path']} 
                    target="_blank" 
                    rel="noreferrer"
                    style={styles.linkButton}
                  >
                    Open in New Tab
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p style={styles.text}>No screenshot available</p>
          )}
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Other Visual Assets</h3>
          <div style={styles.visualAssetsGrid}>
            {instruction.visual_assets && Object.entries(instruction.visual_assets)
              .filter(([key]) => key !== 'screenshot_path')
              .map(([key, path]) => (
                <div key={key} style={styles.visualAssetItem}>
                  <h4 style={styles.visualAssetTitle}>{key.replace(/_/g, ' ')}</h4>
                  <img 
                    src={imageErrors[key] 
                      ? placeholderImage 
                      : signedUrls[key] || placeholderImage}
                    alt={key} 
                    style={styles.visualAssetThumbnail}
                    onError={() => handleImageError(key, path)}
                  />
                  {signedUrls[key] && (
                    <a 
                      href={signedUrls[key]} 
                      target="_blank" 
                      rel="noreferrer"
                      style={styles.smallLinkButton}
                    >
                      View Full Size
                    </a>
                  )}
                </div>
              ))
            }
            {(!instruction.visual_assets || 
              Object.entries(instruction.visual_assets).filter(([key]) => key !== 'screenshot_path').length === 0) && (
              <p style={styles.text}>No additional visual assets available</p>
            )}
          </div>
        </div>
        
        {instruction.instruction_history && instruction.instruction_history.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Instruction History</h3>
            <div style={styles.historyContainer}>
              {instruction.instruction_history.map((historyItem, index) => (
                <div key={index} style={styles.historyItem}>
                  <p><strong>ID:</strong> {historyItem.instruction_id}</p>
                  <p><strong>Instruction:</strong> {historyItem.instruction}</p>
                  <p><strong>Environment:</strong> {historyItem.environment}</p>
                  <p><strong>Input:</strong> {historyItem.input || 'N/A'}</p>
                  <p><strong>Output:</strong> {historyItem.output || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
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
  },
  historyContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  historyItem: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #eee',
  },
  visualAssetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  },
  visualAssetItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  visualAssetTitle: {
    fontSize: '1rem',
    color: '#444',
    textAlign: 'center',
  },
  visualAssetThumbnail: {
    width: '100%',
    height: 'auto',
    borderRadius: '6px',
    border: '1px solid #ddd',
  },
};
