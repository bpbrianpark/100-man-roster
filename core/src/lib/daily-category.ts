import { prisma } from "../../lib/prisma";

/*  Gets the daily category for today using a date-based seed. Returns the slug of the daily category. */
export async function getDailyCategory(): Promise<string> {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  const seed = todayISO;

  const availableCategories = await prisma.category.findMany({
    where: {
      isDaily: true,
      hasBeenSelected: false,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (availableCategories.length === 0) {
    throw new Error("No daily categories available");
  }

  const selectedIndex = hashString(seed) % availableCategories.length;
  const selectedCategory = availableCategories[selectedIndex];

  await prisma.category.update({
    where: { id: selectedCategory.id },
    data: {
      hasBeenSelected: true,
      playedOn: today,
    },
  });

  return selectedCategory.slug;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash);
}

