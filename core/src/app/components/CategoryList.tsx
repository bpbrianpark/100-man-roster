import { useCallback, useEffect, useState } from "react";
import CategoryButton from "./CategoryButton";

export default function CategoryList() {
    const [categories, setCategories] = useState<any[]>([]);


    const fetchCategories = useCallback(() => {
      fetch(`/api/categories`, { cache: "no-store" })
        
        .then((res) => res.json())
        .then((data) => setCategories(data))
        .catch(console.error);
    }, [])

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);
  return (
    <div className="category-link-grid">
      {categories.map((category) => (
        <CategoryButton key={category.id} slug={category.slug} name={category.name} />
      ))}
    </div>
  );
}
