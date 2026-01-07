

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Activity } from '@/lib/data';
import { format } from 'date-fns';

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
    const { id } = body;

    // Logic for UPDATING an existing pass
    if (id && activities.some(a => a.id === id)) {
        const activityIndex = activities.findIndex(a => a.id === id);

        if (activityIndex === -1) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }
        
        const existingActivity = activities[activityIndex];

        // Merge the existing activity with the new body data
        const updatedActivity = { ...existingActivity, ...body };

        if (body.status === 'Approved' && !body.approvedAt) {
            updatedActivity.approvedAt = new Date().toISOString();
        }
        if (body.status === 'Checked In' && !body.checkedInAt) {
            updatedActivity.checkedInAt = new Date().toISOString();
        }
        if (body.status === 'Checked Out' && !body.checkedOutAt) {
            updatedActivity.checkedOutAt = new Date().toISOString();
        }

        activities[activityIndex] = updatedActivity;
        await writeData(activities);
        return NextResponse.json(updatedActivity);

    } 
    // Logic for CREATING a new pass
    else {
        let imageUrl = body.photo;
        const { user } = body;

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

        const now = new Date();
        const todayDateStr = format(now, 'yyyy-MM-dd');
        
        const passesToday = activities.filter(a => a.date === todayDateStr);
        const nextIdNumber = passesToday.length + 1;
        
        const formattedDate = format(now, 'MM/yyyy/dd');
        const [month, year, day] = formattedDate.split('/');

        const newId = `GPID/${month}/${year}/${day}/${String(nextIdNumber).padStart(2, '0')}`;

        const newActivity: Activity = {
          id: newId,
          visitorName: body.visitorName,
          mobileNumber: body.mobileNumber,
          companyName: body.companyName,
          location: body.location,
          passType: body.passType,
          vehicle: body.vehicle,
          photo: imageUrl,
          time: format(now, "hh:mm a"),
          date: todayDateStr,
          status: body.status,
          approverIds: body.approverIds || [],
          requesterId: user?.id,
          visitingLocation: body.visitingLocation,
          purposeOfVisit: body.purposeOfVisit,
          ...(body.status === 'Approved' && { approvedAt: now.toISOString(), approvedById: body.approvedById }),
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
