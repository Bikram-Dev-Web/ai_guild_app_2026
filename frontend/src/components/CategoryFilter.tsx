import React, { useState, useEffect } from "react";
import newsAPI from "../services/newsAPI";

interface Category {
  id: string;
  label: string;
  icon: string;
}

interface CategoryFilterProps {
  onCategoryChange: (category: string) => void;
  isLoading: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  onCategoryChange,
  isLoading,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState("general");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await newsAPI.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    setSelected(categoryId);
    onCategoryChange(categoryId);
  };

  return (
    <div className="mb-6 px-4">
      <h4 className="text-lg font-bold mb-4 text-gray-800">Categories</h4>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              selected === category.id
                ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md shadow-rose-200"
                : "bg-rose-100 text-rose-700 hover:bg-rose-200"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => handleCategoryClick(category.id)}
            disabled={isLoading}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
