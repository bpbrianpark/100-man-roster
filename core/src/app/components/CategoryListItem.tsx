"use client";

import "./category-list-item.css";
import Link from "next/link";

interface CategoryListItemProps {
  slug: string;
  name: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default function CategoryListItem({
  slug,
  name,
}: CategoryListItemProps) {
  return (
    <div className="category-list-item">
      <span className="category-list-item-name">{name}</span>
      <div className="category-list-item-buttons">
        <Link
          href={`${baseUrl}/quiz/${slug}`}
          className="category-list-button-link"
        >
          <button className="category-list-button normal">
            <span className="category-list-button-text">Normal</span>
          </button>
        </Link>
        <Link
          href={`${baseUrl}/blitz/${slug}`}
          className="category-list-button-link"
        >
          <button className="category-list-button blitz">
            <span className="category-list-button-text">Blitz</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
