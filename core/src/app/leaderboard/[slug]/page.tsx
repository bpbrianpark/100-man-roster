import Leaderboard from "@/app/components/Leaderboard";
import { prisma } from "../../../../lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      difficulties: {
        orderBy: { level: "asc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const initialGames = await prisma.game.findMany({
    where: {
      slug: slug,
      difficultyId: category.difficulties[0]?.id,
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

  // Map games to include username for backward compatibility
  const gamesWithUsername = initialGames.map((game) => ({
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

  return (
    <div className="p-6">
      <Leaderboard
        category={category}
        difficulties={category.difficulties}
        initialGames={gamesWithUsername}
        slug={slug}
      />
    </div>
  );
}
