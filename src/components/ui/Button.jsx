import React from "react";

export function Button({ className = "", children, ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium bg-white text-blue-600 hover:text-black dark:bg-white dark:hover:bg-blue-600 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}