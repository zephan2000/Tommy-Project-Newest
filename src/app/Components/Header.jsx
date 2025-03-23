import React from "react";

function Header({ currentPage, onNavigate }) {
  // Define the navigation items
  const navItems = [
    { id: "home", label: "Home" },
    { id: "building-design", label: "Current Building Design" },
    { id: "desired-criteria", label: "Desired Criteria" },
    { id: "building-search", label: "Building Search" }
  ];

  // Determine which items should be visible based on current page
  const getVisibleItems = () => {
    const currentIndex = navItems.findIndex(item => item.id === currentPage);
    
    if (currentIndex === -1) return [navItems[0]];
    
    // Only include current page and previous pages (not future pages)
    return navItems.slice(0, currentIndex + 1);
  };

  const visibleItems = getVisibleItems();

  return (
    <header className="app-header p-4 bg-[#ECE8E1] w-full">
      <nav className="breadcrumb-nav max-w-6xl mx-auto px-4">
        <ul className="flex items-center">
          {visibleItems.map((item, index) => {
            // Determine if this nav item is current or clickable
            const isCurrent = currentPage === item.id;
            // Previous pages are always clickable
            const isClickable = !isCurrent;
            
            return (
              <React.Fragment key={item.id}>
                {/* Add separator between items */}
                {index > 0 && (
                  <li className="mx-3 text-4xl text-gray-300 font-light">
                    {">"}
                  </li>
                )}
                
                <li>
                  <button
                    onClick={() => isClickable && onNavigate(item.id)}
                    className={`text-xl ${
                      isCurrent 
                        ? " text-gray-300 font-medium cursor-default" 
                        : "text-gray-400 hover:underline cursor-pointer"
                    }`}
                    disabled={!isClickable}
                  >
                    {item.label}
                  </button>
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

export default Header;