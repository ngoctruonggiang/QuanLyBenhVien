"use client";
import React, { useState } from "react";

// Interface đã định nghĩa:
interface TabItem {
  title: string;
  content: React.ReactNode;
  // Bạn có thể thêm một trường count? để hiển thị số lượng (ví dụ: Reviews (5))
  count?: number;
}

interface TabbedContentProps {
  // Thay thế mảng object đơn lẻ bằng mảng object: tabs: TabItem[]
  tabs: TabItem[];
  // Thêm một prop tùy chọn để xác định tab mặc định
  defaultTabTitle?: string;
}

const TabbedContent = ({ tabs, defaultTabTitle }: TabbedContentProps) => {
  // Tìm title của tab đầu tiên hoặc tab mặc định nếu được cung cấp
  const initialTab = defaultTabTitle
    ? defaultTabTitle
    : tabs.length > 0
      ? tabs[0].title
      : "";

  // State để theo dõi tab nào đang active, sử dụng title làm key
  const [activeTabTitle, setActiveTabTitle] = useState<string>(initialTab);

  // Tìm nội dung (content) của tab đang active
  const activeTab = tabs.find((tab) => tab.title === activeTabTitle);

  return (
    <div className="w-full font-sa">
      {/* 1. Khu vực Tabs Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, index) => {
          // So sánh title của tab hiện tại với title đang active trong state
          const isActive = tab.title === activeTabTitle;

          return (
            <button
              key={index} // Sử dụng index hoặc title làm key
              onClick={() => setActiveTabTitle(tab.title)}
              className={`
                px-6 py-3 text-center text-sm font-medium 
                transition duration-150 ease-in-out 
                cursor-pointer select-none
                ${
                  isActive
                    ? "text-app-primary-blue-700 border-b-2 border-app-primary-blue-700" // Màu xanh, có viền dưới
                    : "text-gray-500 hover:text-gray-800" // Màu xám, hover đổi màu
                }
              `}
            >
              {tab.title}

              {/* Thêm số lượng nếu count được cung cấp */}
              {tab.count !== undefined && (
                <span className="ml-1 text-xs">({tab.count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Khu vực Tabs Content */}
      <div className="pt-6">
        {/* Render nội dung (content) của activeTab */}
        {activeTab ? (
          activeTab.content
        ) : (
          <p className="text-gray-500">Vui lòng chọn một Tab.</p>
        )}
      </div>
    </div>
  );
};
export default TabbedContent;
