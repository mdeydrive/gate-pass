
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Activity } from '@/lib/data';

// The path to our JSON "database"
const dataFilePath = path.join(process.cwd(), 'src/data/gate-pass-data.json');
const imagesDirPath = path.join(process.cwd(), 'public/images');

// Helper function to read the data file
async function readData(): Promise<Activity[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // If the file doesn't exist, return an empty array
      return [];
    }
    throw error;
  }
}

// Helper function to write data to the file
async function writeData(data: Activity[]) {
  // Ensure the directory exists
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Helper function to save an image
async function saveImage(base64Data: string): Promise<string> {
    // Ensure the images directory exists
    await fs.mkdir(imagesDirPath, { recursive: true });

    // Remove the data URI prefix (e.g., "data:image/png;base64,")
    const base64String = base64Data.split(';base64,').pop();
    if (!base64String) {
        throw new Error('Invalid base64 image data');
    }
    const buffer = Buffer.from(base64String, 'base64');
    
    // Create a unique filename
    const fileExtension = base64Data.substring("data:image/".length, base64Data.indexOf(";base64"));
    const filename = `pass-${Date.now()}.${fileExtension || 'png'}`;
    const imagePath = path.join(imagesDirPath, filename);

    await fs.writeFile(imagePath, buffer);

    // Return the public URL for the image
    return `/images/${filename}`;
}


// GET /api/activities - Fetches all activities
export async function GET() {
  try {
    const activities = await readData();
    return NextResponse.json(activities);
  } catch (error) {
    console.error("Failed to read data:", error);
    return NextResponse.json({ message: 'Failed to read data' }, { status: 500 });
  }
}

// POST /api/activities - Creates a new activity or updates status
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const activities = await readData();

    // Logic for UPDATING an existing pass status
    if (body.id && body.status && activities.some(a => a.id === body.id)) {
        const { id, status } = body;
        const activityIndex = activities.findIndex(a => a.id === id);

        if (activityIndex === -1) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }
        
        const updatedActivity = { ...activities[activityIndex], status: status };

        if (status === 'Checked Out') {
            updatedActivity.checkoutTime = body.checkoutTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        }

        activities[activityIndex] = updatedActivity;
        await writeData(activities);
        return NextResponse.json(updatedActivity);

    } 
    // Logic for CREATING a new pass
    else {
        let imageUrl = body.photo;

        // If a photo is included and it's a base64 string, save it
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:image')) {
          try {
            imageUrl = await saveImage(imageUrl);
          } catch(e) {
            console.error("Image saving failed:", e);
            // Decide if you want to fail or just save the pass without an image
            imageUrl = undefined;
          }
        } else if (imageUrl && typeof imageUrl === 'string') {
          // It's likely already a URL, so do nothing.
        } else {
          // Photo is not provided or in an unexpected format
          imageUrl = undefined;
        }

        const newActivity: Activity = {
          id: body.id,
          visitorName: body.visitorName,
          mobileNumber: body.mobileNumber,
          companyName: body.companyName,
          location: body.location,
          passType: body.passType,
          vehicle: body.vehicle,
          photo: imageUrl,
          time: body.time,
          date: body.date,
          status: body.status,
        };
        
        activities.unshift(newActivity); // Add to the beginning of the list
        await writeData(activities);

        return NextResponse.json(newActivity, { status: 201 });
    }

  } catch (error) {
    console.error("[API_ERROR] Failed to process request:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to process request', error: errorMessage }, { status: 500 });
  }
}
