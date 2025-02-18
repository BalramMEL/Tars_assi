import { DataRow } from "@/constants/Data";

export default function TabBar() {
  return (
    <div className="flex items-start space-x-2 bg-gray-100rounded-lg">
      {
        DataRow().map((item) => (
          <button
            key={item.id}
            className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-200 transition h-2"
          >
            {item.icon}
            <span>{item.title}</span>
          </button>
        ))
      }
    </div>
  );
}
