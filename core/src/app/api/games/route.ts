import { prisma } from "../../../../lib/prisma";
import { createClient } from "../../../../lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Endpoint to retrieve all the games (for the leaderboard)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const difficultyId = searchParams.get("difficultyId");

  if (!slug || !difficultyId) {
    return NextResponse.json(
      { error: "Games not found for category or difficulty." },
      { status: 404 },
    );
  }

  // RLS will automatically filter games to only show authenticated users' games
  // For leaderboard, we want to show all games (not just current user's)
  // So we use a service role connection or query without RLS filtering
  const games = await prisma.game.findMany({
    where: {
      slug,
      difficultyId,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
    orderBy: [{ correct_count: "desc" }, { time: "asc" }],
    take: 25,
  });

  if (!games || games.length === 0) {
    return NextResponse.json({ error: "Games not found" }, { status: 404 });
  }

  // Map games to include username for backward compatibility
  const gamesWithUsername = games.map((game) => ({
    id: game.id,
    userId: game.userId,
    username: game.user.username,
    slug: game.slug,
    difficultyId: game.difficultyId,
    time: game.time,
    targetCount: game.targetCount,
    correct_count: game.correct_count,
    isBlitzGame: game.isBlitzGame,
    isDailyGame: game.isDailyGame,
    entriesCounted: game.entriesCounted,
  }));

  return NextResponse.json(gamesWithUsername);
}

// Endpoint to put the game inside the database after completion
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn(
        "[/api/games] Guest submission ignored for game persistence",
      );
      return NextResponse.json({ ok: true, guest: true }, { status: 200 });
    }

    const body = await req.json();
    const {
      slug,
      difficultyId,
      time,
      targetCount,
      correct_count,
    }: {
      slug?: string;
      difficultyId?: string;
      time?: number;
      targetCount?: number | null;
      correct_count?: number;
    } = body;

    console.log("[/api/games] Received submission", {
      slug,
      difficultyId,
      userId: user.id,
      correct_count,
      time,
      targetCount,
    });

    if (
      !slug ||
      !difficultyId ||
      correct_count === undefined ||
      time === undefined ||
      targetCount === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required field." },
        { status: 400 },
      );
    }

    // RLS will enforce that userId matches authenticated user
    const game = await prisma.game.create({
      data: {
        slug,
        difficultyId,
        time,
        targetCount,
        userId: user.id, // Use user.id from Supabase Auth
        correct_count,
      },
    });

    console.log("[/api/games] Game persisted", { gameId: game.id });

    return NextResponse.json(game, { status: 201 });
  } catch (e) {
    console.error("[/api/games] Failed to persist game", e);
    return NextResponse.json({
      message: "Could not post game.",
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
