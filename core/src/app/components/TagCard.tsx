"use client";

import { useState } from "react";
import { TagCardProps } from "./types";
import CategoryListItem from "./CategoryListItem";
import { ChevronDown, ChevronUp } from "lucide-react";
import "./tag-card.css";

const TAG_DISPLAY_NAMES: Record<string, string> = {
  "people": "People",
  "Pokemon": "Pokemon",
  "sports": "Sports",
  "biology": "Biology",
  "tv": "TV",
  "anime": "Anime",
  "movies": "Movies",
  "video games": "Video Games",
  "world": "World",
  "Other": "Other",
};

export default function TagCard({
  tagName,
  categories,
  imageUrl,
}: TagCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayName = TAG_DISPLAY_NAMES[tagName] || 
    tagName.charAt(0).toUpperCase() + tagName.slice(1);
  const headerImage = imageUrl || null;

  return (
    <div className="tag-card">
      <button
        className="tag-card-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="tag-card-header-image-wrapper">
          {headerImage ? (
            <img
              src={headerImage}
              alt={displayName}
              className="tag-card-header-image"
            />
          ) : (
            <div className="tag-card-header-image-placeholder">
              <span className="tag-card-header-placeholder-icon">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <h2 className="tag-card-header-title">{displayName}</h2>
        <div className="tag-card-header-chevron">
          {isExpanded ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="tag-card-content">
          <div className="tag-card-categories-list">
            {categories.map((category) => (
              <CategoryListItem
                key={category.id}
                slug={category.slug}
                name={category.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

