// src/services/api.js

const BASE_URL = '/api'; 
// Because of "proxy": "http://localhost:3005", 
// requests to '/api' will be proxied to http://localhost:3005/api

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
  const response = await fetch(`${BASE_URL}/tasks/${taskId}/instructions`);
  if (!response.ok) {
    throw new Error(`Error fetching instructions for task ${taskId}`);
  }
  return response.json();
}

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
  const response = await fetch(`${BASE_URL}/instructions/${instructionId}/actions`);
  if (!response.ok) {
    throw new Error(`Error fetching actions for instruction ${instructionId}`);
  }
  return response.json();
}

export async function deleteTask(taskId) {
  const response = await fetch(`${BASE_URL}/task/${taskId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Error deleting task');
  return response.json();
}

export async function deleteInstruction(instructionId) {
  const response = await fetch(`${BASE_URL}/instructions/${instructionId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Error deleting instruction');
  return response.json();
}

export async function deleteAction(actionId) {
  const response = await fetch(`${BASE_URL}/actions/${actionId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Error deleting action');
  return response.json();
}

/**
 * Below are placeholders for "running" tasks, instructions, or actions.
 * You can define them as needed, for example:
 */
export async function runTask(taskId) {
  // For example, your server might have a POST endpoint:
  // await fetch(`${BASE_URL}/runTask/${taskId}`, { method: 'POST' });
  console.log(`Placeholder: runTask called with ${taskId}`);
}

export async function runInstruction(instructionId) {
  // Placeholder
  console.log(`Placeholder: runInstruction called with ${instructionId}`);
}

export async function runAction(actionId) {
  // Placeholder
  console.log(`Placeholder: runAction called with ${actionId}`);
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

export async function updateActionValidation(actionId, validationData) {
  const url = `${BASE_URL}/actions/${actionId}/validation`;
  console.log('URL:', url);
  console.log('Method:', 'POST');
  console.log('Original payload:', validationData);

  // The validation data should be sent directly without any wrapper
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(validationData)
  });
  
  console.log('Response status:', response.status);
  console.log('Response status text:', response.statusText);
  
  if (!response.ok) {
    console.error('Error response:', response);
    throw new Error('Error updating action validation');
  }
  
  const data = await response.json();
  return data;
}
