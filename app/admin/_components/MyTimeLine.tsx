"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  date: string;
  title: string;
  department: string;
  doctor: string;
  isLast?: boolean;
  active?: boolean;
  onClick?: () => void;
}

interface TimelineData {
  date: string;
  title: string;
  department: string;
  doctor: string;
}

const data: TimelineData[] = [
  {
    date: "12/11/2025",
    title: "Bronchitis",
    department: "Internal Medicine",
    doctor: "Dr. Tran B",
  },
  {
    date: "05/09/2025",
    title: "Hypertension",
    department: "Cardiology",
    doctor: "Dr. Lam C",
  },
  {
    date: "20/05/2025",
    title: "Annual checkup",
    department: "General",
    doctor: "Dr. Pham D",
  },
];

export default function OutpatientTimeline() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col">
      {data.map((item, index) => (
        <TimelineItem
          key={index}
          {...item}
          isLast={index === data.length - 1}
          active={activeIndex === index} // check item active
          onClick={() => setActiveIndex(index)} // click để chọn
        />
      ))}
    </div>
  );
}

const TimelineItem = ({
  date,
  title,
  department,
  doctor,
  active,
  isLast,
  onClick,
}: TimelineItemProps) => {
  return (
    <div className="flex gap-4 cursor-pointer" onClick={onClick}>
      {/* Left timeline */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div
          className={cn(
            "rounded-full w-3 h-3 transition-colors",
            active ? "bg-app-primary-blue-500" : "bg-gray-300"
          )}
        ></div>

        {/* Line */}
        {!isLast && <div className="w-0.5 bg-gray-300 h-10"></div>}
      </div>

      {/* Right Content */}
      <div>
        <p className="text-[14px] font-medium">
          {date} - {title}
        </p>
        <p className="text-[12px] text-[#475569]">
          {department} - {doctor}
        </p>
      </div>
    </div>
  );
};
