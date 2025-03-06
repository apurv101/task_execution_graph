import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchActionById, updateActionValidation } from '../services/api';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [isScreenshotExpanded, setIsScreenshotExpanded] = useState(false);
  const [validationForm, setValidationForm] = useState({
    valid: false,
    validation_comments: ''
  });
  // Add state for tracking image loading errors and signed URLs
  const [imageErrors, setImageErrors] = useState({});
  const [signedUrls, setSignedUrls] = useState({});

  // Get signed URLs for S3 objects
  const getSignedImageUrl = async (objectKey) => {
    if (!objectKey) return '';
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
        Key: objectKey,
      });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      console.log(`Generated signed URL for ${objectKey}: ${signedUrl}`);
      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return '';
    }
  };

  // Generate signed URLs for all images
  const generateAllSignedUrls = async (actionData) => {
    if (!actionData?.visual_assets) return;
    
    const urls = {};
    const visualAssets = actionData.visual_assets;
    
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
    const loadAction = async () => {
      try {
        const data = await fetchActionById(actionId);
        console.log('Loaded action data:', data);
        setAction(data);
        
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
        console.error('Error loading action:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadAction();
  }, [actionId]);

  const handleValidationUpdate = async () => {
    try {
      const validationPayload = {
        valid: validationForm.valid,
        validation_comments: validationForm.validation_comments
      };
      
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

  const togglePrompt = () => {
    setIsPromptExpanded((prev) => !prev);
  };

  const toggleScreenshot = () => {
    setIsScreenshotExpanded((prev) => !prev);
  };

  // Helper function to handle image errors
  const handleImageError = (key, path) => {
    console.error(`Failed to load image: ${path}`);
    setImageErrors(prev => ({
      ...prev,
      [key]: true
    }));
  };

  if (loading) return <p style={styles.loading}>Loading action details...</p>;
  if (error) return <p style={styles.error}>Error: {error}</p>;
  if (!action) return <p style={styles.error}>No action found with ID {actionId}</p>;

  // Define placeholder image from public folder
  const placeholderImage = process.env.PUBLIC_URL + '/logo192.png';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Action Details</h1>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.subtitle}>ID: {action.action_id}</h2>
          <span style={{
            ...styles.status,
            backgroundColor: action.status === 'completed' ? '#e0f2e9' : '#fff3e0'
          }}>
            Status: {action.status || 'N/A'}
          </span>
        </div>

        {action.parent && action.parent.instruction_id && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Parent Instruction</h3>
            <Link to={`/instructions/${action.parent.instruction_id}`} style={styles.link}>
              View Instruction {action.parent.instruction_id}
            </Link>
          </div>
        )}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Sequence</h3>
          <p style={styles.text}>{action.sequence || 'N/A'}</p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Hierarchy Level</h3>
          <p style={styles.text}>{action.hierarchy_level || 'N/A'}</p>
        </div>

        {action.llm_data && action.llm_data.prompt && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Prompt</h3>
            <pre style={styles.promptBox}>
              <code>
                {isPromptExpanded
                  ? action.llm_data.prompt
                  : action.llm_data.prompt.slice(0, 100) + 
                    (action.llm_data.prompt.length > 100 ? '...' : '')}
              </code>
            </pre>
            {action.llm_data.prompt.length > 100 && (
              <button 
                onClick={togglePrompt} 
                style={styles.controlButton}
              >
                {isPromptExpanded ? 'Collapse' : 'Expand'}
              </button>
            )}
          </div>
        )}

        {action.llm_data && action.llm_data.llm_output && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>LLM Output</h3>
            <pre style={styles.codeBox}>
              {JSON.stringify(action.llm_data.llm_output, null, 2)}
            </pre>
          </div>
        )}

        {action.visual_assets && action.visual_assets.screenshot_path && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Screenshot</h3>
            <div style={styles.screenshotContainer}>
              <img
                src={imageErrors['screenshot'] 
                  ? placeholderImage 
                  : signedUrls['screenshot_path'] || placeholderImage}
                alt="Action screenshot"
                style={{
                  ...styles.screenshot,
                  ...(isScreenshotExpanded && styles.expandedScreenshot)
                }}
                onClick={toggleScreenshot}
                onError={() => {
                  console.error(`Failed to load screenshot: ${action.visual_assets.screenshot_path}`);
                  handleImageError('screenshot', action.visual_assets.screenshot_path);
                }}
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
          </div>
        )}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Other Visual Assets</h3>
          <div style={styles.visualAssetsGrid}>
            {action.visual_assets && Object.entries(action.visual_assets)
              .filter(([key]) => key !== 'screenshot_path') // Skip screenshot as it's shown separately
              .map(([key, path]) => {
                return (
                  <div key={key} style={styles.visualAssetItem}>
                    <h4 style={styles.visualAssetTitle}>{key.replace(/_/g, ' ')}</h4>
                    <img 
                      src={imageErrors[key] 
                        ? placeholderImage 
                        : signedUrls[key] || placeholderImage}
                      alt={key} 
                      style={styles.visualAssetThumbnail}
                      onError={() => {
                        console.error(`Failed to load image "${key}": ${path}`);
                        handleImageError(key, path);
                      }}
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
                );
              })
            }
            {(!action.visual_assets || 
              Object.entries(action.visual_assets).filter(([key]) => key !== 'screenshot_path').length === 0) && (
              <p style={styles.text}>No additional visual assets available</p>
            )}
          </div>
        </div>

        {action.action_history && action.action_history.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Action History</h3>
            <div style={styles.historyContainer}>
              {action.action_history.map((historyItem, index) => (
                <div key={index} style={styles.historyItem}>
                  <h4 style={styles.historyTitle}>Previous Action: {historyItem.action_id}</h4>
                  {historyItem.actions && historyItem.actions.map((actionItem, actionIndex) => (
                    <div key={actionIndex} style={styles.actionItem}>
                      <p><strong>Action Type:</strong> {actionItem.action}</p>
                      <p><strong>Description:</strong> {actionItem.description}</p>
                      {actionItem.clickable_coordinates && (
                        <p><strong>Coordinates:</strong> [{actionItem.clickable_coordinates.join(', ')}]</p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

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
  screenshot: {
    width: '100%', 
    maxWidth: '500px',
    cursor: 'pointer',
    border: '1px solid #ddd',
    borderRadius: '6px',
  },
  expandedScreenshot: {
    maxWidth: '90vw',
    maxHeight: '80vh',
  },
  screenshotContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '10px',
  },
  visualAssetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '15px',
  },
  visualAssetItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  visualAssetTitle: {
    fontSize: '0.9rem',
    margin: '0 0 8px 0',
    textTransform: 'capitalize',
  },
  visualAssetThumbnail: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
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
  loading: {
    fontSize: '1.2rem',
    color: '#666',
    textAlign: 'center',
    margin: '50px 0',
  },
  error: {
    fontSize: '1.2rem',
    color: '#dc3545',
    textAlign: 'center',
    margin: '50px 0',
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
  smallLinkButton: {
    textDecoration: 'none',
    color: '#2196f3',
    fontSize: '0.8rem',
    padding: '4px 8px',
    marginTop: '5px',
  },
  imageControls: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
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
  },
  historyTitle: {
    fontSize: '1rem',
    color: '#444',
    marginTop: 0,
    marginBottom: '10px',
  },
  actionItem: {
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  link: {
    color: '#2196f3',
    textDecoration: 'none',
  },
};
