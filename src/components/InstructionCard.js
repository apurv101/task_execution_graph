// src/components/InstructionCard.js
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
 * Renders a single Instruction as a "card" with partial action previews.
 * Expects 'instruction' object with fields:
 *   - instruction_id
 *   - instruction
 *   - environment
 *   - visual_assets
 *   - child_actions_ids
 * 
 * The 'showDetailsLink' prop determines whether we link to the Instruction details page.
 */
export default function InstructionCard({ instruction, showDetailsLink = true }) {
  if (!instruction) return null;

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
      if (!instruction?.visual_assets) return;
      
      const urls = {};
      const visualAssets = instruction.visual_assets;
      
      for (const [key, path] of Object.entries(visualAssets)) {
        if (path) {
          urls[key] = await getSignedImageUrl(path);
        }
      }
      
      setSignedUrls(urls);
    };

    generateSignedUrls();
  }, [instruction]);

  // Get the visual assets for thumbnails
  const { visual_assets = {} } = instruction;
  
  // Create an array of available paths and their corresponding signed URLs
  const thumbnailSources = [
    'screenshot_path',
    'google_vision_plot',
    'yolo_plot',
    'yolo_icons_plot',
    'annotated_plot'
  ]
  .filter(key => visual_assets[key] && signedUrls[key])
  .slice(0, 3); // Take up to 3 images to show

  return (
    <div style={styles.card}>
      <h3>Instruction: {instruction.instruction_id}</h3>
      <p style={styles.instructionText}>{instruction.instruction}</p>
      
      {instruction.environment && (
        <p style={styles.environment}>Environment: {instruction.environment}</p>
      )}

      {/* Show thumbnails if available */}
      {thumbnailSources.length > 0 && (
        <div style={styles.imageRow}>
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
        </div>
      )}

      <div style={styles.footer}>
        {instruction.status && (
          <span style={{
            ...styles.status,
            backgroundColor: instruction.status === 'completed' ? '#e6f4ea' : '#fff8e1'
          }}>
            {instruction.status}
          </span>
        )}
        
        {showDetailsLink && (
          <Link to={`/instructions/${instruction.instruction_id}`} style={styles.link}>
            View Full Instruction Details
          </Link>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #ccc',
    margin: '10px 0',
    padding: '15px',
    borderRadius: '4px',
    backgroundColor: '#fafafa',
  },
  instructionText: {
    fontSize: '1rem',
    color: '#333',
    marginBottom: '10px',
  },
  environment: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '10px',
    padding: '4px 8px',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    display: 'inline-block',
  },
  imageRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '10px',
  },
  thumbnail: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px',
    paddingTop: '10px',
    borderTop: '1px solid #eee',
  },
  status: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  link: {
    color: '#2196f3',
    textDecoration: 'none',
    fontSize: '0.9rem',
  }
};
