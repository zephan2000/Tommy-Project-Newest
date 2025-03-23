import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GreenmarkProvider, useGreenmark } from "./GreenmarkContext";

// Import pages
import HeroPage from "./HeroPage";
import BuildingDesignPage from "./BuildingDesignPage";
import DesiredCriteriaPage from "./DesiredCriteriaPage";
import BuildingSearchPage from "./BuildingSearchPage";

// Updated Step component for timeline navigation
export function Step({ stepNumber }) {
  const { currentStep, stepCriteriaMap, criteria, stepsCompleted } =
    useGreenmark();
  const isActive = stepNumber === currentStep;
  const isCompleted = stepNumber < currentStep || stepsCompleted[stepNumber];
  const isPending = !isActive && !isCompleted;

  const stepConfig = stepCriteriaMap[stepNumber] || {};
  const { title, description, field } = stepConfig;

  // Get the value for this step to display when completed
  const stepValue = field ? criteria[field] : "";

  return (
    <div
      className={`flex items-center mb-16 relative ${
        isActive ? "active" : isCompleted ? "completed" : "pending"
      }`}
    >
      {/* Text content - right aligned */}
      <div className="flex-grow text-right pr-4">
        <div
          className={`text-base ${
            isActive
              ? "text-[#627E75] font-medium"
              : isCompleted
              ? "text-[#32C685]"
              : "text-[#B5BEB6]"
          }`}
        >
          {title || `Step ${stepNumber}`}
          {isCompleted && stepValue && (
            <span className="ml-2 text-sm font-normal">({stepValue})</span>
          )}
        </div>
        <div
          className={`text-sm ${
            isActive ? "text-[#394843]" : "text-[#A4A8A2]"
          }`}
        >
          {description || "Complete this step"}
        </div>
      </div>

      {/* Circle with number and connecting line elements */}
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 relative z-10 flex items-center justify-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isActive
                ? "bg-[#32C685] text-white"
                : isCompleted
                ? "bg-[#32C685] text-white"
                : "bg-[#F4F1ED] text-[#B5BEB6]"
            }`}
          >
            {stepNumber}
          </div>
        </div>

        {/* Right-side indicator dot - only visible for non-active steps */}
        {!isActive && (
          <div
            className={`absolute right-0 w-3 h-3 rounded-full ${
              isCompleted ? "bg-[#32C685]" : "bg-[#B5BEB6]"
            } transform translate-x-1/2`}
            style={{ right: "6px" }}
          ></div>
        )}

        {/* Current step indicator - green dot */}
        {isActive && (
          <div
            className="absolute right-0 w-5 h-5 rounded-full bg-[#32C685] transform translate-x-1/2"
            style={{ right: "5px" }}
          ></div>
        )}
      </div>
    </div>
  );
}

// Home confirmation dialog component
export function HomeConfirmationDialog({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-[#ECE8E1] rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-serif text-[#394843] mb-4">
          Are you sure you want to redirect to Home?
        </h2>
        <p className="text-[#627E75] mb-8">
          Your search results will reset when you redirect to the homepage
        </p>
        <div className="flex justify-between border-t border-gray-200 pt-4">
          <button
            onClick={onCancel}
            className="px-8 py-2 bg-gray-200 text-[#394843] rounded-full font-medium hover:bg-gray-300"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-2 bg-[#32C685] text-white rounded-full font-medium hover:bg-[#28A06A]"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

// Greenmark Dashboard App - Main Component with Context Provider
export function GreenmarkDashboard(props) {
  return (
    <GreenmarkProvider>
      <main className="relative w-full h-screen bg-[#ECE8E1]">
        <GreenmarkApp
          BuildingDesignPageComponent={
            props.BuildingDesignPageComponent || BuildingDesignPage
          }
          DesiredCriteriaPageComponent={
            props.DesiredCriteriaPageComponent || DesiredCriteriaPage
          }
          BuildingSearchPageComponent={
            props.BuildingSearchPageComponent || BuildingSearchPage
          }
          HeroPageComponent={props.HeroPageComponent || HeroPage}
        />
      </main>
    </GreenmarkProvider>
  );
}
function GreenmarkApp({
  BuildingDesignPageComponent,
  DesiredCriteriaPageComponent,
  BuildingSearchPageComponent,
  HeroPageComponent,
  TimelineStepComponent = Step, // Default to the existing Step component
}) {
  const [currentPage, setCurrentPage] = useState("home");
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [navigationDirection, setNavigationDirection] = useState("forward"); // Add this state variable
  const {
    currentStep,
    setCurrentStep,
    setCriteria,
    setSearchResults,
    setStepsCompleted,
  } = useGreenmark();

  // Define the navigation items
  const navItems = [
    { id: "home", label: "Home" },
    { id: "building-design", label: "Current Building Design" },
    { id: "desired-criteria", label: "Desired Criteria" },
    { id: "building-search", label: "Building Search" },
  ];

  // Reset all search results and criteria
  const resetSearchState = () => {
    // Reset criteria to initial state
    setCriteria({
      Types_of_building: "",
      Pathway: "",
      Does_the_design_have_DCS_OR_DDC_OR_CCS: "",
      buildingStatus: "New",
      ETTV_Criteria: "NRBE01-1",
      currentEUI: "",
      currentASE: "",
      currentETTV: "",
      currentACMVTSE: "",
    });

    // Reset search results
    setSearchResults([]);

    // Reset steps completed
    setStepsCompleted({});
  };

  // Then update the pageVariants to ensure proper animations:
const pageVariants = {
  initial: (direction) => ({
    x: direction === "forward" ? "100%" : "-100%",
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: "tween",
      ease: "easeInOut",
      duration: 0.5,
    }
  },
  exit: (direction) => ({
    x: direction === "forward" ? "-100%" : "100%",
    opacity: 0,
    transition: {
      type: "tween",
      ease: "easeInOut",
      duration: 0.5,
    }
  }),
};

  const handleNavigate = (page) => {
    console.log(`Navigating to: ${page}`);
  
    // Special case for home navigation (always set forward direction when going to home)
    if (page === "home") {
      setNavigationDirection("forward");
      
      // If not already there, show confirm dialog
      if (currentPage !== "home") {
        setShowHomeConfirm(true);
        setPendingNavigation("home");
        return;
      }
    } else {
      // For non-home pages, determine direction based on page order
      const currentPageIndex = navItems.findIndex(item => item.id === currentPage);
      const targetPageIndex = navItems.findIndex(item => item.id === page);
      
      // Set direction based on page order
      if (targetPageIndex < currentPageIndex) {
        setNavigationDirection("backward");
      } else {
        setNavigationDirection("forward");
      }
    }
  
    // Navigate directly
    setCurrentPage(page);
  
    // Reset current step based on page navigation
    if (page === "building-design") {
      setCurrentStep(1);
    } else if (page === "desired-criteria") {
      setCurrentStep(6);
    }
  };

// Also fix the confirmNavigation function to maintain the backward direction
const confirmNavigation = () => {
  if (pendingNavigation === "home") {
    // Reset all search state before navigating to home
    resetSearchState();
    
    // Ensure the direction is set to backward for home navigation
    setNavigationDirection("backward");
    
    // Set the page
    setCurrentPage("home");
  } else if (pendingNavigation) {
    setCurrentPage(pendingNavigation);
  }

  setPendingNavigation(null);
  setShowHomeConfirm(false);
};

  const cancelNavigation = () => {
    setPendingNavigation(null);
    setShowHomeConfirm(false);
  };

  // Add Google Fonts
  useEffect(() => {
    // Add Google Fonts link
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Roboto:wght@400;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      // Cleanup
      document.head.removeChild(link);
    };
  }, []);

  // Update the AnimatePresence and motion.div structure for consistent positioning
return (
  <div className="flex flex-col h-full">
    {/* Home Confirmation Dialog */}
    <HomeConfirmationDialog
      isOpen={showHomeConfirm}
      onCancel={cancelNavigation}
      onConfirm={confirmNavigation}
    />

    {/* Display header on all pages except home */}
    {currentPage !== "home" && (
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
    )}

    {/* Main Content with Page Transitions */}
    <div className="flex-grow relative overflow-hidden">
      <AnimatePresence mode="wait" custom={navigationDirection}>
        {currentPage === "home" && (
          <motion.div
            key="home"
            custom={navigationDirection}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            className="absolute inset-0"
          >
            <HeroPageComponent onNavigate={handleNavigate} />
          </motion.div>
        )}

        {currentPage === "building-design" && (
          <motion.div
            key="building-design"
            custom={navigationDirection}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="h-full overflow-auto">
              <BuildingDesignPageComponent onNavigate={handleNavigate} />
            </div>
          </motion.div>
        )}

        {currentPage === "desired-criteria" && (
          <motion.div
            key="desired-criteria"
            custom={navigationDirection}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="h-full overflow-auto">
              <DesiredCriteriaPageComponent onNavigate={handleNavigate} />
            </div>
          </motion.div>
        )}

        {currentPage === "building-search" && (
          <motion.div
            key="building-search"
            custom={navigationDirection}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="h-full overflow-auto">
              <BuildingSearchPageComponent onNavigate={handleNavigate} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
}

// Replace the current Header function with this in GreenmarkApp.jsx
function Header({ currentPage, onNavigate }) {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  // In the Header component in GreenmarkApp.jsx:
  useEffect(() => {
    const handleWindowScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    // Listen for custom scroll events from content elements
    const handleCustomScroll = (event) => {
      setVisible(event.detail.visible);
    };

    window.addEventListener("scroll", handleWindowScroll);
    window.addEventListener("headerVisibility", handleCustomScroll);

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
      window.removeEventListener("headerVisibility", handleCustomScroll);
    };
  }, [prevScrollPos]);

  // Add scroll event listener to hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  // Define the navigation items
  const navItems = [
    { id: "home", label: "Home" },
    { id: "building-design", label: "Current Building Design" },
    { id: "desired-criteria", label: "Desired Criteria" },
    { id: "building-search", label: "Building Search" },
  ];

  // Determine which items should be visible based on current page
  const getVisibleItems = () => {
    const currentIndex = navItems.findIndex((item) => item.id === currentPage);

    if (currentIndex === -1) return [navItems[0]];

    // Only include current page and previous pages (not future pages)
    return navItems.slice(0, currentIndex + 1);
  };

  const visibleItems = getVisibleItems();

  return (
    <header
      className={`app-header p-4 bg-[#ECE8E1] w-full fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
        visible ? "transform-none" : "transform -translate-y-full"
      }`}
    >
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
                        ? "text-[#627E75] font-bold cursor-default"
                        : "text-gray-400 cursor-pointer"
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

export default GreenmarkApp;
