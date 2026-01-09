
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// This file acts as a simple, shared state for call signaling.
// In a real-world application, this would be replaced by a real-time database (like Firestore) or a WebSocket server.

const dataFilePath = path.join(process.cwd(), 'src/data/call-signal.json');

type CallUser = {
  id: string;
  name: string;
  avatar: string;
};

type CallData = {
  user1: CallUser; // Caller
  user2: CallUser; // Callee
  status: 'ringing' | 'active' | 'connecting';
  offer?: any;
  answer?: any;
  candidates?: any[];
};

type SignalFile = {
    call: CallData | null;
}

// Helper to read the data file
async function readSignal(): Promise<SignalFile> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { call: null };
    }
    throw error;
  }
}

// Helper function to write data to the file
async function writeSignal(data: SignalFile) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}


// GET /api/call-signal - Fetches the current call state
export async function GET() {
  try {
    const signal = await readSignal();
    return NextResponse.json(signal);
  } catch (error) {
    console.error("Failed to read signal data:", error);
    return NextResponse.json({ message: 'Failed to read signal data' }, { status: 500 });
  }
}

// POST /api/call-signal - Updates the call state
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, call, offer, answer, candidate } = body;

    let currentSignal = await readSignal();
    let response: SignalFile = currentSignal;

    switch (action) {
      case 'initiate':
        response = { call: { ...call, status: 'ringing', offer, candidates: [] } };
        break;
      case 'accept':
         if (currentSignal.call) {
            response = { call: { ...currentSignal.call, status: 'active', answer } };
         }
        break;
      case 'add-candidate':
        if (currentSignal.call && candidate) {
            const existingCandidates = currentSignal.call.candidates || [];
            response = { call: { ...currentSignal.call, candidates: [...existingCandidates, candidate] } };
        }
        break;
      case 'end':
      case 'decline':
      case 'cancel':
        response = { call: null };
        break;
      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    await writeSignal(response);
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("[API_ERROR] Failed to process signal request:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to process request', error: errorMessage }, { status: 500 });
  }
}

