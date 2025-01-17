// src/pages/ActionDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchActionById, runAction } from '../services/api';

export default function ActionDetails() {
  const { actionId } = useParams();
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const normalizePath = (path) => path.replace('/instructions/images/', '/images/');

  


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

  if (loading) return <p>Loading Action...</p>;
  if (!action) return <p>No action found with ID {actionId}</p>;

  return (
    <div>
      <h1>Action Details</h1>
      <h2>Action ID: {action.action_id}</h2>
      <p><strong>Task:</strong> {action.task || 'N/A'}</p>
      <div>
        <strong>Prompt:</strong>
        <pre>
          <p>
            {isPromptExpanded
              ? action.prompt || 'N/A'
              : (action.prompt?.slice(0, 100) || 'N/A') + (action.prompt?.length > 100 ? '...' : '')}
          </p>
        </pre>
        {action.prompt && action.prompt.length > 100 && (
          <button onClick={togglePrompt} style={{ marginTop: '10px' }}>
            {isPromptExpanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>
      <p><strong>Status:</strong> {action.status || 'N/A'}</p>
      <p>
        <strong>Start Time:</strong>{' '}
        {action.start_time ? new Date(action.start_time).toLocaleString() : 'N/A'}
      </p>
      <p>
        <strong>End Time:</strong>{' '}
        {action.end_time ? new Date(action.end_time).toLocaleString() : 'In Progress'}
      </p>
      <ul>
        {action.screenshot_path && (
          <li>
            Screenshot: <a href={normalizePath(action.screenshot_path)} target="_blank" rel="noreferrer">View</a>
          </li>
        )}
        {action.google_vision_plot && (
          <li>
            Google Vision Plot: <a href={normalizePath(action.google_vision_plot)} target="_blank" rel="noreferrer">View</a>
          </li>
        )}
        {action.yolo_plot && (
          <li>
            YOLO Plot: <a href={normalizePath(action.yolo_plot)} target="_blank" rel="noreferrer">View</a>
          </li>
        )}
        {action.yolo_icons_plot && (
          <li>
            YOLO Icons Plot: <a href={normalizePath(action.yolo_icons_plot)} target="_blank" rel="noreferrer">View</a>
          </li>
        )}
        {action.annotated_plot && (
          <li>
            Annotated Plot: <a href={normalizePath(action.annotated_plot)} target="_blank" rel="noreferrer">View</a>
          </li>
        )}
      </ul>
      <p><strong>LLM Output:</strong> <pre>{JSON.stringify(action.llm_output, null, 2)}</pre></p>
      {/* If there's an LLM output text field */}
      {/* <p><strong>LLM Output Text:</strong> {action.llm_output_text || 'N/A'}</p> */}
      <button onClick={handleRunAction}>Run This Action</button>
    </div>
  );
}
