"use client";

import CategoryButton from "./CategoryButton";
import HeroSection from "./HeroSection";
import { CategoryType } from "./types";
import AdSlot from "./AdSlot";

interface CategoryListProps {
  initialCategories: CategoryType[];
}

export default function CategoryList({ initialCategories }: CategoryListProps) {
  const sideAdSlotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR;
  const bottomAdSlotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_CATEGORIES_BOTTOM;

  return (
    <div className="category-page-shell">
      <aside className="category-side-rail">
        <AdSlot slot={sideAdSlotId} className="side-rail-ad" />
      </aside>
      <div className="category-center-column">
        <HeroSection />
        <div className="categories-container">
          <div className="categories-header">
            <h2 className="categories-title">Choose a Category</h2>
            <p className="categories-description">
              Select a category and game mode to start playing
            </p>
          </div>
          <div className="category-link-grid" id="categories">
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
          <AdSlot slot={bottomAdSlotId} className="bottom-banner-ad" />
      </div>
      <aside className="category-side-rail">
        <AdSlot slot={sideAdSlotId} className="side-rail-ad" />
      </aside>
    </div>
  );
}