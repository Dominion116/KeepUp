import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;

export interface TaskProof {
  ipfsUrl: string;
  timestamp: number;
  fileName: string;
}

// Upload file to IPFS via Pinata
export const uploadToIPFS = async (file: File): Promise<string> => {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error('Pinata API credentials not configured');
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: `keepup-proof-${Date.now()}`,
  });
  formData.append('pinataMetadata', metadata);

  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data`,
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
      }
    );

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload proof to IPFS');
  }
};

// LocalStorage key for task proofs
const STORAGE_KEY = 'keepup-task-proofs';

export interface TaskProofMapping {
  [taskId: string]: {
    [date: string]: TaskProof;
  };
}

// Get all task proofs
export const getTaskProofs = (): TaskProofMapping => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save task proofs
const saveTaskProofs = (proofs: TaskProofMapping): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proofs));
  } catch (error) {
    console.error('Failed to save task proofs:', error);
  }
};

// Add proof for a task completion
export const addTaskProof = (
  taskId: string | bigint,
  ipfsUrl: string,
  fileName: string
): void => {
  const id = taskId.toString();
  const proofs = getTaskProofs();
  
  if (!proofs[id]) {
    proofs[id] = {};
  }
  
  const today = new Date().toISOString().split('T')[0];
  proofs[id][today] = {
    ipfsUrl,
    timestamp: Date.now(),
    fileName,
  };
  
  saveTaskProofs(proofs);
};

// Get proof for a specific task and date
export const getTaskProof = (
  taskId: string | bigint,
  date?: string
): TaskProof | null => {
  const id = taskId.toString();
  const proofs = getTaskProofs();
  const taskProofs = proofs[id];
  
  if (!taskProofs) return null;
  
  const dateKey = date || new Date().toISOString().split('T')[0];
  return taskProofs[dateKey] || null;
};

// Get all proofs for a task
export const getAllTaskProofs = (taskId: string | bigint): TaskProof[] => {
  const id = taskId.toString();
  const proofs = getTaskProofs();
  const taskProofs = proofs[id];
  
  if (!taskProofs) return [];
  
  return Object.values(taskProofs).sort((a, b) => b.timestamp - a.timestamp);
};

// Remove all proofs for a task
export const removeTaskProofs = (taskId: string | bigint): void => {
  const id = taskId.toString();
  const proofs = getTaskProofs();
  delete proofs[id];
  saveTaskProofs(proofs);
};
