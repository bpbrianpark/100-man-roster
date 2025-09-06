import { prisma } from "../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Endpoint to retrieve all the categories
export async function GET(req: NextRequest) {    
  const categories = await prisma.category.findMany();

  if (!categories) {
    return NextResponse.json({ error: "Categories not found" }, { status: 404 });
  }

  return NextResponse.json(categories);
}
