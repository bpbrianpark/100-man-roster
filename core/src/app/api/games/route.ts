import { prisma } from "../../../../lib/prisma";
import { normalize } from "path";
import { queryWDQS } from "../../../../lib/wdqs";
import { NextRequest, NextResponse } from "next/server";

// Endpoint to retrieve all the games (for the leaderboard)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const difficultyId = searchParams.get('difficultyId');

  if (!slug || !difficultyId) {
    return NextResponse.json({ error: "Games not found for category or difficulty." }, { status: 404 });
  }
    
  const game = await prisma.game.findMany({
    where: { slug: slug,
        difficultyId: difficultyId }
  });

  if (!game) {
    return NextResponse.json({ error: "Games not found" }, { status: 404 });
  }

  return NextResponse.json(game);
}