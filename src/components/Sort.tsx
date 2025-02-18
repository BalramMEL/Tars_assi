"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SortButtonProps {
  sortOrder: "newest" | "oldest";
  setSortOrder: (value: "newest" | "oldest") => void;
  className?: string;
}

const SortButton = ({ sortOrder, setSortOrder, className = "" }: SortButtonProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`flex items-center rounded-full ${className}`}>
          <SlidersHorizontal className="mr-2" /> Sort
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-70">
        <RadioGroup value={sortOrder} onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="newest" id="newest" />
            <label htmlFor="newest">Newest to Oldest</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="oldest" id="oldest" />
            <label htmlFor="oldest">Oldest to Newest</label>
          </div>
        </RadioGroup>
      </PopoverContent>
    </Popover>
  );
};

export default SortButton;