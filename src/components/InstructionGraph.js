// src/components/InstructionGraph.js
import React, { useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
  Position,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { fetchInstructionById, fetchActionsByInstructionId } from '../services/api';

/**
 * Component that displays a graph visualization of a single instruction and its child actions
 */
export default function InstructionGraph({ instructionId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!instructionId) {
      setError('No instruction ID provided');
      setLoading(false);
      return;
    }

    async function loadGraph() {
      try {
        // Fetch the instruction and its actions
        const instruction = await fetchInstructionById(instructionId);
        const actions = await fetchActionsByInstructionId(instructionId);

        // Create nodes and edges
        const newNodes = [];
        const newEdges = [];

        // Add the main instruction node
        newNodes.push({
          id: `instruction-${instruction.instruction_id}`,
          type: 'default',
          position: { x: 250, y: 100 },
          data: { 
            label: `${instruction.instruction || 'Instruction'}`,
            environment: instruction.environment || 'N/A',
          },
          style: {
            background: '#e3f2fd',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #2196f3',
            width: 200,
          },
          sourcePosition: Position.Bottom,
        });

        // Add the parent task node if it exists
        if (instruction.parent && instruction.parent.task_id) {
          const taskNodeId = `task-${instruction.parent.task_id}`;
          
          newNodes.push({
            id: taskNodeId,
            type: 'default',
            position: { x: 250, y: 0 },
            data: { 
              label: `Task: ${instruction.parent.task_id}`,
            },
            style: {
              background: '#D6E4FF',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #2979ff',
              width: 200,
            },
            targetPosition: Position.Bottom,
          });

          // Create an edge from task to the instruction
          newEdges.push({
            id: `${taskNodeId}-instruction-${instruction.instruction_id}`,
            source: taskNodeId,
            target: `instruction-${instruction.instruction_id}`,
            markerEnd: {
              type: MarkerType.Arrow,
            },
            animated: true,
            style: { stroke: '#2979ff' },
          });
        }

        // Position actions in a grid layout below the instruction
        const columns = 3;
        const actionsPerRow = Math.min(columns, actions.length);
        const horizontalSpacing = 220;
        const verticalSpacing = 80;
        const startX = 250 - ((actionsPerRow - 1) * horizontalSpacing) / 2;

        // Add action nodes
        actions.forEach((action, index) => {
          const row = Math.floor(index / columns);
          const col = index % columns;
          const x = startX + col * horizontalSpacing;
          const y = 220 + row * verticalSpacing;

          // Add the action node
          newNodes.push({
            id: `action-${action.action_id}`,
            type: 'default',
            position: { x, y },
            data: { 
              label: `${action.action || 'Action'} (${action.status || 'unknown'})`,
            },
            style: {
              width: 180,
              background: '#e8f5e9',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #4caf50',
            },
            targetPosition: Position.Top,
          });

          // Add edge from instruction to action
          newEdges.push({
            id: `instruction-${instruction.instruction_id}-action-${action.action_id}`,
            source: `instruction-${instruction.instruction_id}`,
            target: `action-${action.action_id}`,
            markerEnd: {
              type: MarkerType.Arrow,
            },
            animated: true,
            style: { stroke: '#4caf50' },
          });
        });

        setNodes(newNodes);
        setEdges(newEdges);
        setLoading(false);
      } catch (err) {
        console.error('Error loading instruction graph:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadGraph();
  }, [instructionId]);

  if (loading) {
    return <div style={styles.loading}>Loading instruction graph...</div>;
  }

  if (error) {
    return <div style={styles.error}>Error: {error}</div>;
  }

  return (
    <div style={styles.graphContainer}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

const styles = {
  graphContainer: {
    height: '500px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '20px',
    color: '#d32f2f',
  },
};
