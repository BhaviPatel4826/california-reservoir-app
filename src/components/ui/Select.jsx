import React, { useState, useRef, useEffect } from "react";

export default function Select({ options, value, currentValue, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt === value);

  return (
    <div className="relative inline-block w-72" ref={ref}>
      {/* Trigger */}
      <div
        className="bg-white  border-white rounded-lg px-3 py-2 shadow-md cursor-pointer select-none"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {selectedOption ? (
          <span className="text-blue-600 font-bold">{selectedOption.label}</span>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute mt-1 w-full  rounded bg-white shadow-md z-1001 max-h-60 overflow-auto">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`px-3 py-2 cursor-pointer ${
                currentValue === opt
                  ? "bg-blue-500 text-white font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
