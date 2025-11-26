import QuizGame from "@/app/components/QuizGame";
import { prisma } from "../../lib/prisma";
import { notFound } from "next/navigation";
import { getDailyCategory } from "../lib/daily-category";

export const dynamic = "force-dynamic";

export default async function Home() {
  console.log("[Home] Starting daily category fetch");
  console.log("[Home] Environment:", {
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + "...",
  });

  let slug: string;
  try {
    slug = await getDailyCategory();
    console.log("[Home] Successfully got daily category slug:", slug);
  } catch (error) {
    console.error("[Home] Error getting daily category:", error);
    console.error("[Home] Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorCode: (error as any)?.errorCode,
      clientVersion: (error as any)?.clientVersion,
    });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service Temporarily Unavailable</h1>
          <p className="text-gray-600">We're experiencing database connectivity issues. Please try again later.</p>
        </div>
      </div>
    );
  }

  console.log("[Home] Fetching category data for slug:", slug);
  let category;
  try {
    category = await prisma.category.findUnique({
      where: { slug },
      include: {
        difficulties: {
          orderBy: { level: "asc" },
        },
      },
    });
    console.log("[Home] Category found:", category ? category.name : "null");
  } catch (error) {
    console.error("[Home] Error fetching category:", error);
    throw error;
  }

  let totalEntries;
  try {
    totalEntries = await prisma.entry.count({
      where: { categoryId: category?.id },
    });
    console.log("[Home] Total entries:", totalEntries);
  } catch (error) {
    console.error("[Home] Error counting entries:", error);
    throw error;
  }

  if (!category) {
    console.error("[Home] Category not found for slug:", slug);
    notFound();
  }

  console.log("[Home] Successfully rendering QuizGame");
  return (
    <QuizGame
      aliases={[]}
      category={category}
      difficulties={category.difficulties || []}
      entries={[]}
      totalEntries={totalEntries}
      slug={slug}
      isDynamic={category.isDynamic}
    />
  );
}
