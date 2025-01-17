// src/components/ActionCard.js
import React from 'react';
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
  if (!action) return null;

  return (
    <div style={styles.card}>
      <h3>Action: {action.action_id}</h3>
      <p>Status: {action.status || 'N/A'}</p>

      {/* A small gallery row for any images available */}
      <div style={styles.imageRow}>
        {action.screenshot_path && (
          <img
            src={action.screenshot_path.replace('/instructions/', '/')}
            alt="Screenshot"
            style={styles.thumbnail}
          />
        )}
        {action.google_vision_plot && (
          <img
            src={action.google_vision_plot}
            alt="Google Vision Plot"
            style={styles.thumbnail}
          />
        )}
        {action.yolo_plot && (
          <img
            src={action.yolo_plot}
            alt="YOLO Plot"
            style={styles.thumbnail}
          />
        )}
        {action.yolo_icons_plot && (
          <img
            src={action.yolo_icons_plot}
            alt="YOLO Icons Plot"
            style={styles.thumbnail}
          />
        )}
        {action.annotated_plot && (
          <img
            src={action.annotated_plot}
            alt="Annotated Plot"
            style={styles.thumbnail}
          />
        )}
      </div>

      {showDetailsLink && (
        <p>
          <Link to={`/actions/${action.action_id}`}>
            View Full Action Details
          </Link>
        </p>
      )}
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #ccc',
    margin: '10px 0',
    padding: '10px',
    borderRadius: '4px',
    backgroundColor: '#fafafa',
  },
  imageRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  thumbnail: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
};
