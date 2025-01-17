// src/components/InstructionGraph.js
import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  Background
} from 'react-flow-renderer';

function InstructionGraph({ instruction }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Generate nodes/edges from instruction
  const generateGraphData = useCallback(() => {
    if (!instruction) return;

    // Root node for the instruction
    const instructionId = `instruction-${instruction.instruction_id}`;
    const newNodes = [
      {
        id: instructionId,
        data: { label: `Instruction: ${instruction.instruction_id}` },
        position: { x: 300, y: 50 },
        style: {
          background: '#FEF9C3',
          padding: 10,
          border: '1px solid #222',
        },
      },
    ];
    const newEdges = [];

    // Now create nodes/edges for each action
    if (instruction.actions && Array.isArray(instruction.actions)) {
      let yOffset = 180; // Start placing action nodes below instruction

      instruction.actions.forEach((action) => {
        const actionNodeId = `action-${action.action_id}`;
        newNodes.push({
          id: actionNodeId,
          data: { label: `Action: ${action.action_id}` },
          position: { x: 300, y: yOffset },
          style: {
            background: '#D1FAD7',
            padding: 10,
            border: '1px solid #222',
          },
        });

        // Create edge from instruction node -> action node
        newEdges.push({
          id: `edge-${instructionId}-${actionNodeId}`,
          source: instructionId,
          target: actionNodeId,
        });

        yOffset += 100; // increment the Y position for the next action
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [instruction, setNodes, setEdges]);

  useEffect(() => {
    generateGraphData();
  }, [instruction, generateGraphData]);

  return (
    <div style={{ width: '100%', height: '500px', border: '1px solid #ccc', marginTop: '20px' }}>
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

export default InstructionGraph;
