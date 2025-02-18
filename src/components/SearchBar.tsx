"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  placeholder = "Search by title or content"
}: SearchBarProps) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-10 py-2 w-full border rounded-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;