// src/components/TaskGraph.js
import React, { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useEdgesState,
  useNodesState,
} from 'react-flow-renderer';

/**
 * This is a very simplified example that generates nodes and edges
 * from your "task" object structure. In a real scenario, you'd want
 * to adapt the logic for instructions / actions array.
 * 
 * For example, let's assume:
 *   task.instructions = [
 *       { instruction_id: 'instr1', instruction: 'Click Outlook icon', actions: [...] },
 *       ...
 *   ]
 * 
 * We'll flatten that data to build nodes and edges for instructions + actions.
 */
export default function TaskGraph({ task }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // A simple function to generate graph data from task
  const generateGraphData = useCallback(() => {
    if (!task || !task.instructions) return;

    const newNodes = [];
    const newEdges = [];

    // Root node for Task
    const taskNodeId = `task-${task.task_id}`;
    newNodes.push({
      id: taskNodeId,
      data: { label: `Task: ${task.task_id}` },
      position: { x: 300, y: 50 },
      style: { background: '#B8CEFF', padding: 10, border: '1px solid #222' },
    });

    let yOffset = 150; // to place instruction nodes down the page

    task.instructions.forEach((instruction, idx) => {
      const instrNodeId = `instr-${instruction.instruction_id}`;
      newNodes.push({
        id: instrNodeId,
        data: { label: `Instruction: ${instruction.instruction_id}` },
        position: { x: 300, y: yOffset },
        style: { background: '#FEF9C3', padding: 10, border: '1px solid #222' },
      });

      // Edge from Task -> Instruction
      newEdges.push({
        id: `edge-${taskNodeId}-${instrNodeId}`,
        source: taskNodeId,
        target: instrNodeId,
      });

      yOffset += 120;

      if (instruction.actions) {
        instruction.actions.forEach((action, actionIdx) => {
          const actionNodeId = `action-${action.action_id}`;
          newNodes.push({
            id: actionNodeId,
            data: { label: `Action: ${action.action_id}` },
            position: { x: 600, y: yOffset },
            style: { background: '#D1FAD7', padding: 10, border: '1px solid #222' },
          });

          // Edge from Instruction -> Action
          newEdges.push({
            id: `edge-${instrNodeId}-${actionNodeId}`,
            source: instrNodeId,
            target: actionNodeId,
          });

          yOffset += 100;
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [task, setNodes, setEdges]);

  // We generate graph data the first time or whenever the task changes
  React.useEffect(() => {
    generateGraphData();
  }, [task, generateGraphData]);

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
