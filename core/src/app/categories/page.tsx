import { prisma } from "../../../lib/prisma";
import CategoryList from "../components/CategoryList";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: {
      isDaily: null,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      imageUrl: true,
      tags: true,
      sparql: true,
      isDynamic: true,
      createdAt: true,
      updatedAt: true,
      isDaily: true,
      hasBeenSelected: true,
      playedOn: true,
      updateSparql: true,
    },
  });

  return <CategoryList initialCategories={categories} />;
}
