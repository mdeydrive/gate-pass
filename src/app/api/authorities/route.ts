
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { ApprovingAuthority } from '@/lib/data';

const dataFilePath = path.join(process.cwd(), 'src/data/authorities-data.json');

async function readData(): Promise<ApprovingAuthority[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeData(data: ApprovingAuthority[]) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const authorities = await readData();
    return NextResponse.json(authorities);
  } catch (error) {
    console.error("Failed to read authorities data:", error);
    return NextResponse.json({ message: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authorities = await readData();

    const newAuthority: ApprovingAuthority = {
        id: `auth-${Date.now()}`,
        name: body.name,
        role: body.role,
        mobileNumber: body.mobileNumber,
        email: body.email,
        avatar: `https://avatar.vercel.sh/${body.name.split(' ').join('')}.png`
    };

    authorities.unshift(newAuthority);
    await writeData(authorities);

    return NextResponse.json(newAuthority, { status: 201 });

  } catch (error) {
    console.error("Failed to process request:", error);
    return NextResponse.json({ message: 'Failed to process request' }, { status: 500 });
  }
}
