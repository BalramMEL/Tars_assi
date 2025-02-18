import React, { useState } from "react";
import { DataRow } from "@/constants/Data";

export default function TabBar() {
  const [activeTab, setActiveTab] = useState(2);

  return (
    <div className="flex items-start space-x-1 bg-gray-200 p-1 rounded-full w-max">
      {DataRow().map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex items-center space-x-1 p-1 transition rounded-full text-sm ${
            activeTab === item.id
              ? "bg-white border border-gray-300 shadow"
              : "hover:bg-gray-200"
          }`}
        >
          {item.icon && React.cloneElement(item.icon, { className: "w-4 h-4" })}
          <span>{item.title}</span>
        </button>
      ))}
    </div>
  );
}