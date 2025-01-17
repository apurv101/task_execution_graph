// src/components/InstructionCard.js
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Renders a single Instruction as a "card" with partial action previews.
 * Expects 'instruction' object with fields:
 *   - instruction_id
 *   - instruction
 *   - actions (array of action objects)
 * 
 * The 'showDetailsLink' prop determines whether we link to the Instruction details page.
 */
export default function InstructionCard({ instruction, showDetailsLink = true }) {
  if (!instruction) return null;

  // We'll show a small row of images from the first few actions (if any)
  const actions = instruction.actions || [];
  const firstFewActions = actions.slice(0, 3);

  return (
    <div style={styles.card}>
      <h3>Instruction: {instruction.instruction_id}</h3>
      <p>{instruction.instruction}</p>

      {/* Show a sample of action images (if you want) */}
      <div style={styles.imageRow}>
        {firstFewActions.map((action) => {
          // just show one image if we have it
          const thumbnailSource =
            action.screenshot_path ||
            action.google_vision_plot ||
            action.yolo_plot ||
            action.yolo_icons_plot ||
            action.annotated_plot;

          return thumbnailSource ? (
            <img
              key={action.action_id}
              src={thumbnailSource}
              alt={action.action_id}
              style={styles.thumbnail}
            />
          ) : null;
        })}
      </div>

      {showDetailsLink && (
        <p>
          <Link to={`/instructions/${instruction.instruction_id}`}>
            View Full Instruction Details
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
    marginTop: '10px',
  },
  thumbnail: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
};
