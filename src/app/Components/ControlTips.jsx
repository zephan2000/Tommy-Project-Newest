import React, { useState } from 'react';
// Install with: npm install react-icons
import { 
  FaMouse,         // Mouse silhouette icon
  FaMousePointer,  // Pointer icon
  FaChevronLeft,   // Left arrow icon
  FaChevronRight   // Right arrow icon
} from 'react-icons/fa';

export const ControlTips = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Panel container with sliding effect */}
      <div
        className="relative w-80 rounded-2xl bg-gray-200 shadow-lg overflow-hidden transition-transform duration-300"
        style={{
          height: '150px', // Adjust the panel height as needed
          transform: isOpen 
            ? 'translateX(0)' 
            : 'translateX(calc(-100% + 1.4rem))' // Only show the toggle button (2.5rem wide)
        }}
      >
        {/* Panel content */}
        <div className="p-4">
          <h4 className="text-lg font-bold mb-2">Control Tips</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <FaMouse className="mr-2" />
              Use mouse scroll to Zoom in / out
            </li>
            <li className="flex items-center">
              <FaMousePointer className="mr-2" />
              Use left mouse button to pan camera around
            </li>
          </ul>
        </div>

        {/* Arrow toggle button on the right side */}
        <button
         className="
         absolute top-0 bottom-0 right-0 
         w-9 
         bg-gray-200 
         flex items-center justify-center 
         rounded-tr-lg rounded-br-lg
         border-l border-gray-300
       "
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
    </div>
  );
};

export default ControlTips;
