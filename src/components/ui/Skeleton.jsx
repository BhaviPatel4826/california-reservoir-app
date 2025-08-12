import React from "react";
import '../../styles/Skeleton.css';
export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-300  rounded-md ${className}`}
    />
  );
}