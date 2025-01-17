// src/pages/TaskDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchTaskById,
  runTask,
  fetchInstructionsByTaskId, 
} from '../services/api';
import InstructionCard from '../components/InstructionCard';

export default function TaskDetails() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);


  const [instructions, setInstructions] = useState([]);
  const [instructionsLoading, setInstructionsLoading] = useState(true);

  useEffect(() => {
    fetchTaskById(taskId)
      .then((data) => {
        setTask(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
      fetchInstructionsByTaskId(taskId)
      .then((data) => {
        setInstructions(data);
        setInstructionsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setInstructionsLoading(false);
      });
  }, [taskId]);

  const handleRunTask = () => {
    runTask(taskId).then(() => {
      alert('Task run triggered (placeholder).');
      // Possibly refetch data
    });
  };

  if (loading) return <p>Loading Task Details...</p>;
  if (!task) return <p>No task found with ID: {taskId}</p>;

  return (
    <div>
      <h1>Task Details - {task.task_id}</h1>
      <p>
        <strong>Name:</strong> {task.task || 'No title'}
      </p>
      <p>
        <strong>Status:</strong> {task.status || 'N/A'}
      </p>
      <p>
        <strong>Start Time:</strong>{' '}
        {task.start_time ? new Date(task.start_time).toLocaleString() : 'N/A'}
      </p>
      <button onClick={handleRunTask}>Run This Task</button>

      {/* Now display the instructions as cards */}
      <h3 style={{ marginTop: '30px' }}>Instructions for this Task</h3>
      {instructionsLoading ? (
        <p>Loading instructions...</p>
      ) : instructions.length > 0 ? (
        instructions.map((instr) => (
          <InstructionCard key={instr.instruction_id} instruction={instr} />
        ))
      ) : (
        <p>No instructions found for this task.</p>
      )}
    </div>
  );
}
