import { prisma } from "../../lib/prisma";
import { prismaAdmin } from "../../lib/prisma-admin";

/*  Gets the daily category for today using a date-based seed. Returns the slug of the daily category. */
export async function getDailyCategory(): Promise<string> {
  console.log("[getDailyCategory] Starting");
  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  console.log("[getDailyCategory] Today UTC:", todayUTC.toISOString());

  try {
    console.log("[getDailyCategory] Checking for existing daily category");
    const todayCategory = await prisma.category.findFirst({
      where: {
        isDaily: true,
        playedOn: {
          gte: todayUTC,
          lt: new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      select: {
        slug: true,
      },
    });

    if (todayCategory) {
      console.log("[getDailyCategory] Found existing daily category:", todayCategory.slug);
      return todayCategory.slug;
    }

    console.log("[getDailyCategory] No existing category found, selecting new one");
    // If not selected yet, select it
    return await selectDailyCategory();
  } catch (error) {
    console.error("[getDailyCategory] Database error:", error);
    console.error("[getDailyCategory] Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      errorCode: (error as any)?.errorCode,
    });
    throw error;
  }
}

// Extract the selection logic
export async function selectDailyCategory(): Promise<string> {
  console.log("[selectDailyCategory] Starting selection process");
  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const todayISO = todayUTC.toISOString().split("T")[0];
  const seed = todayISO;
  console.log("[selectDailyCategory] Date info:", { todayUTC: todayUTC.toISOString(), todayISO, seed });

  try {
    // Check if already selected today (read operation - use regular prisma)
    console.log("[selectDailyCategory] Checking for existing category today");
    const todayCategory = await prisma.category.findFirst({
      where: {
        isDaily: true,
        playedOn: {
          gte: todayUTC,
          lt: new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      select: { slug: true },
    });

    if (todayCategory) {
      console.log("[selectDailyCategory] Already selected today:", todayCategory.slug);
      return todayCategory.slug;
    }

    // Find available categories (read operation - use regular prisma)
    console.log("[selectDailyCategory] Finding available categories");
    const availableCategories = await prisma.category.findMany({
      where: {
        isDaily: true,
        hasBeenSelected: false,
      },
      select: {
        id: true,
        slug: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    console.log("[selectDailyCategory] Available categories count:", availableCategories.length);

    if (availableCategories.length === 0) {
      console.log("[selectDailyCategory] No available categories, resetting all daily categories");
      // Reset all daily categories (write operation - use admin)
      try {
        await prismaAdmin.category.updateMany({
          where: { isDaily: true },
          data: { hasBeenSelected: false },
        });
        console.log("[selectDailyCategory] Successfully reset daily categories");
      } catch (error) {
        console.error("[selectDailyCategory] Error resetting categories:", error);
        console.error("[selectDailyCategory] Admin DB error details:", {
          name: error instanceof Error ? error.name : "Unknown",
          message: error instanceof Error ? error.message : String(error),
          errorCode: (error as any)?.errorCode,
          hasAdminDbUrl: !!process.env.ADMIN_DATABASE_URL,
          adminDbUrlPrefix: process.env.ADMIN_DATABASE_URL?.substring(0, 30) + "...",
        });
        throw error;
      }

      const allDailyCategories = await prisma.category.findMany({
        where: { isDaily: true },
        select: { id: true, slug: true },
        orderBy: { id: "asc" },
      });

      console.log("[selectDailyCategory] All daily categories count:", allDailyCategories.length);

      if (allDailyCategories.length === 0) {
        console.error("[selectDailyCategory] No daily categories found in database");
        throw new Error("No daily categories found in database");
      }

      const selectedIndex = hashString(seed) % allDailyCategories.length;
      const selectedCategory = allDailyCategories[selectedIndex];
      console.log("[selectDailyCategory] Selected category (after reset):", {
        index: selectedIndex,
        id: selectedCategory.id,
        slug: selectedCategory.slug,
      });

      try {
        await prismaAdmin.category.update({
          where: { id: selectedCategory.id },
          data: {
            hasBeenSelected: true,
            playedOn: todayUTC,
          },
        });
        console.log("[selectDailyCategory] Successfully updated category");
      } catch (error) {
        console.error("[selectDailyCategory] Error updating category:", error);
        console.error("[selectDailyCategory] Admin DB update error details:", {
          name: error instanceof Error ? error.name : "Unknown",
          message: error instanceof Error ? error.message : String(error),
          errorCode: (error as any)?.errorCode,
        });
        throw error;
      }

      return selectedCategory.slug;
    }

    const selectedIndex = hashString(seed) % availableCategories.length;
    const selectedCategory = availableCategories[selectedIndex];
    console.log("[selectDailyCategory] Selected category:", {
      index: selectedIndex,
      id: selectedCategory.id,
      slug: selectedCategory.slug,
    });

    try {
      await prismaAdmin.category.update({
        where: { id: selectedCategory.id },
        data: {
          hasBeenSelected: true,
          playedOn: todayUTC,
        },
      });
      console.log("[selectDailyCategory] Successfully updated selected category");
    } catch (error) {
      console.error("[selectDailyCategory] Error updating selected category:", error);
      console.error("[selectDailyCategory] Admin DB update error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        errorCode: (error as any)?.errorCode,
      });
      throw error;
    }

    return selectedCategory.slug;
  } catch (error) {
    console.error("[selectDailyCategory] Fatal error:", error);
    console.error("[selectDailyCategory] Full error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorCode: (error as any)?.errorCode,
      clientVersion: (error as any)?.clientVersion,
    });
    throw error;
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
