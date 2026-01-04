
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/company-data.json');
const imagesDirPath = path.join(process.cwd(), 'public/images');

type CompanyData = {
    companyName?: string;
    logoUrl?: string;
};

async function readData(): Promise<CompanyData> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { companyName: 'SecurePass', logoUrl: '' }; // Default data
    }
    throw error;
  }
}

async function writeData(data: CompanyData) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}


async function saveImage(base64Data: string): Promise<string> {
    await fs.mkdir(imagesDirPath, { recursive: true });

    const base64String = base64Data.split(';base64,').pop();
    if (!base64String) {
        throw new Error('Invalid base64 image data');
    }
    const buffer = Buffer.from(base64String, 'base64');
    
    const fileExtension = base64Data.substring("data:image/".length, base64Data.indexOf(";base64"));
    const filename = `logo-${Date.now()}.${fileExtension || 'png'}`;
    const imagePath = path.join(imagesDirPath, filename);

    await fs.writeFile(imagePath, buffer);

    return `/images/${filename}`;
}


export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to read company data:", error);
    return NextResponse.json({ message: 'Failed to read company data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const currentData = await readData();
    let newLogoUrl = currentData.logoUrl;

    if (body.logoUrl && body.logoUrl.startsWith('data:image')) {
      newLogoUrl = await saveImage(body.logoUrl);
    }

    const updatedData: CompanyData = {
      companyName: body.companyName ?? currentData.companyName,
      logoUrl: newLogoUrl,
    };

    await writeData(updatedData);

    return NextResponse.json(updatedData, { status: 200 });
  } catch (error) {
    console.error("Failed to update company data:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to update company data', error: errorMessage }, { status: 500 });
  }
}
