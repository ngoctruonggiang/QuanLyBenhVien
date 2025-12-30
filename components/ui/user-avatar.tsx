"use client";

import React from "react";
import { User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

interface UserAvatarProps {
  imageUrl?: string | null;
  userName?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-32 h-32 text-4xl",
};

const iconSizes = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-8 h-8",
  xl: "w-16 h-16",
};

export function UserAvatar({ imageUrl, userName, size = "md", className = "" }: UserAvatarProps) {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getGradient = (name?: string) => {
    if (!name) return "from-gray-400 to-gray-500";
    
    const gradients = [
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600",
      "from-purple-400 to-purple-600",
      "from-pink-400 to-pink-600",
      "from-yellow-400 to-yellow-600",
      "from-red-400 to-red-600",
      "from-indigo-400 to-indigo-600",
      "from-teal-400 to-teal-600",
    ];
    
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {imageUrl && <AvatarImage src={imageUrl} alt={userName || "Avatar"} />}
      <AvatarFallback className={`bg-gradient-to-br ${getGradient(userName)} text-white font-semibold`}>
        {userName ? (
          getInitials(userName)
        ) : (
          <User className={iconSizes[size]} />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
