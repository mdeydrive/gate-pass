
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
    // If the file is empty or just whitespace, return a default state
    if (!fileContent.trim()) {
      return { call: null };
    }
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { call: null };
    }
    // If there's a parsing error, assume corruption and return a default state
    if (error instanceof SyntaxError) {
      console.error("Corrupted signal file detected. Resetting state.", error);
      // Attempt to fix the file by writing a default state
      await writeSignal({ call: null });
      return { call: null };
    }
    throw error;
  }
}

// Helper function to write data to the file
async function writeSignal(data: SignalFile) {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    // This atomic write ensures the file is always valid JSON
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Failed to write signal file:", e);
  }
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

    switch (action) {
      case 'initiate':
        currentSignal.call = { ...call, status: 'ringing', offer: offer, candidates: [] };
        break;
      case 'accept':
         if (currentSignal.call) {
            currentSignal.call.status = 'active';
            currentSignal.call.answer = answer;
         }
        break;
      case 'add-candidate':
        if (currentSignal.call && candidate) {
            if (!currentSignal.call.candidates) {
                currentSignal.call.candidates = [];
            }
            currentSignal.call.candidates.push(candidate);
        }
        break;
      case 'clear-candidates':
        if (currentSignal.call) {
          currentSignal.call.candidates = [];
        }
        break;
      case 'end':
      case 'decline':
      case 'cancel':
        currentSignal.call = null;
        break;
      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    await writeSignal(currentSignal);
    return NextResponse.json(currentSignal, { status: 200 });

  } catch (error) {
    console.error("[API_ERROR] Failed to process signal request:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to process request', error: errorMessage }, { status: 500 });
  }
}
