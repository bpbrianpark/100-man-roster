"use client";

import './category-button.css'

import Link from "next/link";

interface CategoryButtonProps {
  slug: string;
  name: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default function CategoryButton({ slug, name }: CategoryButtonProps) {
  return (
    <Link href={`${baseUrl}/quiz/${slug}`}>
      <div className="category-button">
        {/* <Image
          src={imageUrl}
          alt={name}
          width={100}
          height={100}
          className="category-image"
        /> */}
        <div className="category-text-container">
          <h2 className="category-text">{name}</h2>
        </div>
      </div>
    </Link>
  );
}
