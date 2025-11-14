import { redirect } from "next/navigation";
import { getDailyCategory } from "../../lib/daily-category";

export const dynamic = "force-dynamic";

export default async function DailyPage() {
  try {
    const slug = await getDailyCategory();
    redirect(`/quiz/${slug}`);
  } catch (error) {
    console.error("Error getting daily category:", error);
    redirect("/");
  }
}

