
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
    const filename = `pass-${Date.now()}.${fileExtension}`;
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

    // Check if this is a status update
    if (body.id && body.status) {
        const { id, status, checkoutTime } = body;
        const activities = await readData();
        const activityIndex = activities.findIndex(a => a.id === id);

        if (activityIndex === -1) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        const updatedActivity = { ...activities[activityIndex], status };
        if (checkoutTime) {
            updatedActivity.checkoutTime = checkoutTime;
        }

        activities[activityIndex] = updatedActivity;
        await writeData(activities);
        return NextResponse.json(activities[activityIndex]);

    } else {
        // This is a new pass creation
        const newActivityData = body;
        let imageUrl = newActivityData.photo;

        if (imageUrl && imageUrl.startsWith('data:image')) {
          imageUrl = await saveImage(imageUrl);
        }

        const newActivity = { ...newActivityData, photo: imageUrl };
        
        // Ensure checkoutTime is not part of a new pass object
        if ('checkoutTime' in newActivity) {
            delete (newActivity as Partial<Activity>).checkoutTime;
        }

        const activities = await readData();
        activities.unshift(newActivity); // Add to the beginning of the list
        await writeData(activities);

        return NextResponse.json(newActivity, { status: 201 });
    }

  } catch (error) {
    console.error("Failed to process request:", error);
    return NextResponse.json({ message: 'Failed to process request' }, { status: 500 });
  }
}
