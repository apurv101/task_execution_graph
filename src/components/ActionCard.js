// src/components/ActionCard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

/**
 * Renders a single Action as a "card" with preview of action details
 * Expects 'action' object with fields from the actions collection
 */
export default function ActionCard({ action, showDetailsLink = true }) {
  if (!action) return null;

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
      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return '';
    }
  };

  // Generate signed URLs for all images
  useEffect(() => {
    const generateSignedUrls = async () => {
      if (!action?.visual_assets) return;
      
      const urls = {};
      const visualAssets = action.visual_assets;
      
      for (const [key, path] of Object.entries(visualAssets)) {
        if (path) {
          urls[key] = await getSignedImageUrl(path);
        }
      }
      
      setSignedUrls(urls);
    };

    generateSignedUrls();
  }, [action]);

  // Get thumbnails from visual assets if available
  const { visual_assets = {} } = action;
  
  // Create an array of available image paths and their signed URLs for thumbnails
  const thumbnailSources = [
    'screenshot_path',
    'google_vision_plot',
    'yolo_plot',
    'yolo_icons_plot',
    'annotated_plot'
  ]
  .filter(key => visual_assets[key] && signedUrls[key])
  .slice(0, 2); // Take up to 2 images to show

  // Extract action details from the LLM output if available
  const actionDetails = action.llm_data?.llm_output?.actions?.[0] || {};

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Action: {action.action_id}</h3>
        <span style={{
          ...styles.status,
          backgroundColor: action.status === 'completed' ? '#e6f4ea' : '#fff8e1'
        }}>
          {action.status || 'unknown'}
        </span>
      </div>
      
      {actionDetails.description && (
        <p style={styles.description}>{actionDetails.description}</p>
      )}
      
      {actionDetails.action && (
        <div style={styles.actionType}>
          <span style={styles.actionLabel}>Type:</span> {actionDetails.action}
        </div>
      )}
      
      {actionDetails.clickable_coordinates && (
        <div style={styles.coordinates}>
          <span style={styles.actionLabel}>Coordinates:</span> [{actionDetails.clickable_coordinates.join(', ')}]
        </div>
      )}
      
      {action.sequence && (
        <div style={styles.sequenceInfo}>
          <span style={styles.sequence}>Sequence: {action.sequence}</span>
          {action.hierarchy_level && (
            <span style={styles.level}>Level: {action.hierarchy_level}</span>
          )}
        </div>
      )}
      
      {thumbnailSources.length > 0 && (
        <div style={styles.thumbnailContainer}>
          {thumbnailSources.map((key) => (
            <img 
              key={key}
              src={imageErrors[key] ? process.env.PUBLIC_URL + '/logo192.png' : signedUrls[key]} 
              alt={`${key.replace(/_/g, ' ')}`}
              style={styles.thumbnail}
              onError={() => {
                console.error(`Failed to load image for ${key}`);
                setImageErrors(prev => ({
                  ...prev,
                  [key]: true
                }));
              }}
            />
          ))}
          {Object.keys(visual_assets).length > 2 && (
            <div style={styles.moreThumbnails}>
              +{Object.keys(visual_assets).length - 2} more
            </div>
          )}
        </div>
      )}
      
      {action.parent && action.parent.instruction_id && (
        <div style={styles.parentInfo}>
          <span style={styles.parentLabel}>Parent:</span>
          <Link to={`/instructions/${action.parent.instruction_id}`} style={styles.parentLink}>
            Instruction {action.parent.instruction_id}
          </Link>
        </div>
      )}
      
      {showDetailsLink && (
        <div style={styles.footer}>
          <Link to={`/actions/${action.action_id}`} style={styles.link}>
            View Full Details
          </Link>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: '#f9f9f9',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#333',
  },
  status: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  description: {
    fontSize: '0.95rem',
    color: '#444',
    marginBottom: '10px',
  },
  actionType: {
    fontSize: '0.9rem',
    color: '#555',
    marginBottom: '6px',
  },
  actionLabel: {
    fontWeight: '500',
    marginRight: '5px',
  },
  coordinates: {
    fontSize: '0.9rem',
    color: '#555',
    marginBottom: '10px',
    fontFamily: 'monospace',
  },
  sequenceInfo: {
    display: 'flex',
    gap: '15px',
    marginTop: '10px',
    marginBottom: '10px',
  },
  sequence: {
    fontSize: '0.85rem',
    color: '#555',
    backgroundColor: '#f1f1f1',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  level: {
    fontSize: '0.85rem',
    color: '#555',
    backgroundColor: '#f1f1f1',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  thumbnailContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px',
    marginBottom: '10px',
    overflowX: 'auto',
    paddingBottom: '5px',
  },
  thumbnail: {
    width: '70px',
    height: '70px',
    objectFit: 'cover',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  moreThumbnails: {
    backgroundColor: '#eee',
    color: '#666',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
  },
  parentInfo: {
    fontSize: '0.9rem',
    color: '#555',
    marginTop: '10px',
    borderTop: '1px dotted #ddd',
    paddingTop: '10px',
  },
  parentLabel: {
    fontWeight: '500',
    marginRight: '5px',
  },
  parentLink: {
    color: '#2196f3',
    textDecoration: 'none',
  },
  footer: {
    marginTop: '15px',
    textAlign: 'right',
  },
  link: {
    color: '#2196f3',
    textDecoration: 'none',
    fontSize: '0.9rem',
  }
};
