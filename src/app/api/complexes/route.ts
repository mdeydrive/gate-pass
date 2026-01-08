
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Complex } from '@/lib/data';

const dataFilePath = path.join(process.cwd(), 'src/data/complexes-data.json');

async function readData(): Promise<Complex[]> {
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

async function writeData(data: Complex[]) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const complexes = await readData();
    return NextResponse.json(complexes);
  } catch (error) {
    console.error("Failed to read complexes data:", error);
    return NextResponse.json({ message: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const complexes = await readData();

    const newComplex: Complex = {
        id: `cplx-${Date.now()}`,
        name: body.name,
        blocks: body.blocks,
        floors: body.floors,
        units: body.units,
    };

    complexes.push(newComplex);
    await writeData(complexes);

    return NextResponse.json(newComplex, { status: 201 });

  } catch (error) {
    console.error("Failed to process request:", error);
    return NextResponse.json({ message: 'Failed to process request' }, { status: 500 });
  }
}
