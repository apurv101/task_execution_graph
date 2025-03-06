// src/services/api.js

const BASE_URL = '/api'; 
// Because of "proxy": "http://localhost:3005", 
// requests to '/api' will be proxied to http://localhost:3005/api

// Task-related API functions
export async function fetchAllTasks() {
  const response = await fetch(`${BASE_URL}/tasks`);
  if (!response.ok) throw new Error('Error fetching tasks');
  return response.json();
}

export async function fetchTaskById(taskId) {
  const response = await fetch(`${BASE_URL}/task/${taskId}`);
  if (!response.ok) throw new Error('Error fetching task');
  return response.json();
}

export async function deleteTask(taskId) {
  const response = await fetch(`${BASE_URL}/task/${taskId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Error deleting task');
  return response.json();
}

// Instruction-related API functions
export async function fetchAllInstructions() {
  const response = await fetch(`${BASE_URL}/instructions`);
  if (!response.ok) throw new Error('Error fetching instructions');
  return response.json();
}

export async function fetchInstructionById(instructionId) {
  const response = await fetch(`${BASE_URL}/instructions/${instructionId}`);
  if (!response.ok) throw new Error('Error fetching instruction');
  return response.json();
}

export async function fetchInstructionsByTaskId(taskId) {
  // Use the task/:taskId/instructions endpoint as defined in the server
  const response = await fetch(`${BASE_URL}/tasks/${taskId}/instructions`);
  if (!response.ok) {
    throw new Error(`Error fetching instructions for task ${taskId}`);
  }
  return response.json();
}

export async function deleteInstruction(instructionId) {
  const response = await fetch(`${BASE_URL}/instructions/${instructionId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Error deleting instruction');
  return response.json();
}

export async function updateInstructionValidation(instructionId, validation) {
  const response = await fetch(`${BASE_URL}/instructions/${instructionId}/validation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(validation)
  });
  if (!response.ok) throw new Error('Error updating instruction validation');
  return response.json();
}

// Action-related API functions
export async function fetchAllActions() {
  const response = await fetch(`${BASE_URL}/actions`);
  if (!response.ok) throw new Error('Error fetching actions');
  return response.json();
}

export async function fetchActionById(actionId) {
  const response = await fetch(`${BASE_URL}/actions/${actionId}`);
  if (!response.ok) throw new Error('Error fetching action');
  return response.json();
}

export async function fetchActionsByInstructionId(instructionId) {
  // Use the instructions/:instructionId/actions endpoint as defined in the server
  const response = await fetch(`${BASE_URL}/instructions/${instructionId}/actions`);
  if (!response.ok) {
    throw new Error(`Error fetching actions for instruction ${instructionId}`);
  }
  return response.json();
}

export async function deleteAction(actionId) {
  const response = await fetch(`${BASE_URL}/actions/${actionId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Error deleting action');
  return response.json();
}

export async function updateActionValidation(actionId, validationData) {
  const response = await fetch(`${BASE_URL}/actions/${actionId}/validation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(validationData)
  });
  
  if (!response.ok) {
    console.error('Error response:', response);
    throw new Error('Error updating action validation');
  }
  
  return response.json();
}

// Image serving function
export function getImageUrl(absolutePath) {
  if (!absolutePath) return '';
  // Encode the path to ensure it's URL-safe
  const encodedPath = encodeURIComponent(absolutePath);
  return `${BASE_URL}/image-path/${encodedPath}`;
}

/**
 * Functions for running tasks, instructions, or actions - placeholders
 * These are not currently implemented on the server side
 */
export async function runTask(taskId) {
  console.log(`Placeholder: runTask called with ${taskId}`);
  // Implement when server endpoint is available
}

export async function runInstruction(instructionId) {
  console.log(`Placeholder: runInstruction called with ${instructionId}`);
  // Implement when server endpoint is available
}

export async function runAction(actionId) {
  console.log(`Placeholder: runAction called with ${actionId}`);
  // Implement when server endpoint is available
}
