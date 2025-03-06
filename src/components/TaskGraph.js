// src/components/TaskGraph.js
import React, { useEffect, useState } from 'react';
import ReactFlow, { 
  Controls, 
  Background,
  MarkerType,
  Position 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { fetchAllTasks, fetchAllInstructions } from '../services/api';

export default function TaskGraph() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAllTasks(),
      fetchAllInstructions()
    ]).then(([tasksData, instructionsData]) => {
      const newNodes = [];
      const newEdges = [];
      
      // Create nodes for tasks
      tasksData.forEach((task, index) => {
        const taskNodeId = `task-${task.task_id}`;
        
        newNodes.push({
          id: taskNodeId,
          position: { x: 100, y: index * 120 },
          data: { 
            label: `Task: ${task.task_id}`,
            description: task.description || 'No description',
            status: task.status || 'unknown',
            hierarchyLevel: task.hierarchy_level || 1
          },
          style: {
            background: '#D6E4FF',
            padding: 10,
            border: '1px solid #2979ff',
            borderRadius: '4px',
            width: 180,
          },
          sourcePosition: Position.Right,
        });
      });
      
      // Create nodes for instructions
      instructionsData.forEach((instruction, index) => {
        const instructionNodeId = `instruction-${instruction.instruction_id}`;
        
        newNodes.push({
          id: instructionNodeId,
          position: { x: 400, y: index * 120 },
          data: { 
            label: `Instruction: ${instruction.instruction_id}`,
            instruction: instruction.instruction || 'No instruction text',
            environment: instruction.environment || 'unknown',
            status: instruction.status || 'unknown',
            hierarchyLevel: instruction.hierarchy_level || 2,
            sequence: instruction.sequence || 0
          },
          style: {
            background: '#E3F2FD',
            padding: 10,
            border: '1px solid #2196f3',
            borderRadius: '4px',
            width: 180,
          },
          targetPosition: Position.Left,
          sourcePosition: Position.Right,
        });
        
        // Create connections between tasks and instructions (parent-child relationship)
        if (instruction.parent && instruction.parent.task_id) {
          const parentTaskNodeId = `task-${instruction.parent.task_id}`;
          
          newEdges.push({
            id: `${parentTaskNodeId}-${instructionNodeId}`,
            source: parentTaskNodeId,
            target: instructionNodeId,
            type: 'smoothstep',
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            style: { stroke: '#2979ff' },
            label: `Sequence: ${instruction.sequence || '?'}`,
          });
        }
        
        // Create connections between instructions and their actions
        instruction.child_actions_ids?.forEach(actionId => {
          const actionNodeId = `action-${actionId}`;
          
          newEdges.push({
            id: `${instructionNodeId}-${actionNodeId}`,
            source: instructionNodeId,
            target: actionNodeId,
            type: 'smoothstep',
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            style: { stroke: '#4caf50' },
          });
        });
      });
      
      setNodes(newNodes);
      setEdges(newEdges);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading task graph...</div>;
  }

  return (
    <div style={{ height: '700px', border: '1px solid #ddd' }}>
      <ReactFlow 
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
