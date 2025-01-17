import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchInstructionById,
  runInstruction,
  fetchActionsByInstructionId, 
} from '../services/api';
import ActionCard from '../components/ActionCard';

export default function InstructionDetails() {
  const { instructionId } = useParams();
  const [instruction, setInstruction] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for actions
  const [actions, setActions] = useState([]);
  const [actionsLoading, setActionsLoading] = useState(true);

  // State for prompt expansion
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);


  useEffect(() => {
    fetchInstructionById(instructionId)
      .then((data) => {
        setInstruction(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
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

  const handleRunInstruction = () => {
    runInstruction(instructionId).then(() => {
      alert('Instruction run triggered (placeholder).');
    });
  };

  const togglePrompt = () => {
    setIsPromptExpanded((prev) => !prev);
  };

  if (loading) return <p>Loading Instruction...</p>;
  if (!instruction) return <p>No instruction found with ID {instructionId}</p>;

  return (
    <div>
      <h1>Instruction Details</h1>
      <h2>{instruction.instruction_id}</h2>
      <p><strong>Instruction:</strong> {instruction.instruction || 'N/A'}</p>
      <div>
        <strong>Prompt:</strong>
        <pre>
        <p>
          {isPromptExpanded
            ? instruction.prompt || 'N/A'
            : (instruction.prompt?.slice(0, 100) || 'N/A') + (instruction.prompt?.length > 100 ? '...' : '')}
        </p>

        </pre>
        
        {instruction.prompt && instruction.prompt.length > 100 && (
          <button onClick={togglePrompt} style={{ marginTop: '10px' }}>
            {isPromptExpanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>
      <p>
        <strong>Generated Instruction:</strong>{' '}
        <pre>{JSON.stringify(instruction.generated_instruction, null, 2)}</pre>
      </p>
      <p><strong>Status:</strong> {instruction.status || 'N/A'}</p>
      <p>
        <strong>Start Time:</strong>{' '}
        {instruction.start_time ? new Date(instruction.start_time).toLocaleString() : 'N/A'}
      </p>
      <p>
        <strong>Screenshot:</strong>{' '}
        {instruction.screenshot_path 
          ? <a href={instruction.screenshot_path} target="_blank" rel="noreferrer">View</a> 
          : 'No screenshot available'
        }
      </p>
      <button onClick={handleRunInstruction}>Run This Instruction</button>

      {/* Actions */}
      <h3 style={{ marginTop: '30px' }}>Actions in this Instruction</h3>
      {actionsLoading ? (
        <p>Loading actions...</p>
      ) : actions && actions.length > 0 ? (
        actions.map((action) => (
          <ActionCard key={action.action_id} action={action} />
        ))
      ) : (
        <p>No actions found for this instruction.</p>
      )}
    </div>
  );
}
