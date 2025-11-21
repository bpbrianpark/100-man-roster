"use client";

import CategoryButton from "./CategoryButton";
import { CategoryType } from "./types";
import AdSlot from "./AdSlot";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./button.css";

interface CategoryListProps {
  initialCategories: CategoryType[];
}

export default function CategoryList({ initialCategories }: CategoryListProps) {
  const router = useRouter();
  const sideAdSlotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR;
  const bottomAdSlotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_CATEGORIES_BOTTOM;

  return (
    <div className="category-page-shell">
      <aside className="category-side-rail">
        <AdSlot slot={sideAdSlotId} className="side-rail-ad" />
      </aside>
      <div className="category-center-column">
        <div className="categories-page-container">
          <div className="categories-header-section">
            <Image
              src="/logo.svg"
              alt="Recall Race logo"
              width={72}
              height={72}
              className="categories-logo"
              priority
            />
            <h1 className="categories-main-title">Recall Race</h1>
            <p className="categories-main-description">
              Challenge yourself with quizzes across different categories
            </p>
            <div className="categories-header-buttons">
              <button 
                className="header-button"
                onClick={() => router.push("/")}
              >
                Daily Challenge
              </button>
            </div>
          </div>

          <div className="categories-content">
            <div className="category-link-grid">
              {initialCategories.map((category: CategoryType) => (
                <CategoryButton
                  key={category.id}
                  slug={category.slug}
                  name={category.name}
                  imageUrl={category.imageUrl}
                />
              ))}
            </div>
          </div>
        </div>
        <AdSlot slot={bottomAdSlotId} className="bottom-banner-ad" />
      </div>
      <aside className="category-side-rail">
        <AdSlot slot={sideAdSlotId} className="side-rail-ad" />
      </aside>
    </div>
  );
}