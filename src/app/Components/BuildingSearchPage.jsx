import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Eye, EyeOff, Save, X } from "lucide-react";
import { useGreenmark } from "./GreenmarkContext";
import MetricBar from "./MetricBar";
import { Warehouse } from "./Warehouse";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BuildingReportPDF from "./BuildingReportPDF";

// 1. First, implement this ScrollToTopButton component that also handles header visibility events

function ScrollToTopButton({ contentRef, onHeaderVisibilityChange }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  
  useEffect(() => {
    const contentArea = contentRef.current;
    if (!contentArea) return;
    
    const trackScroll = () => {
      // Track progress for the circular indicator
      const scrollTop = contentArea.scrollTop;
      const scrollHeight = contentArea.scrollHeight;
      const clientHeight = contentArea.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
      setScrollProgress(progress);
      setIsButtonVisible(scrollTop > 300);
      
      // Handle header visibility
      const currentScrollPos = scrollTop;
      const shouldBeVisible = prevScrollPos > currentScrollPos || currentScrollPos < 10;
      
      // Use the callback to update parent component
      if (onHeaderVisibilityChange) {
        onHeaderVisibilityChange(shouldBeVisible);
      }
      
      // Also dispatch the event for the header in GreenmarkApp.jsx
      const headerVisibilityEvent = new CustomEvent("headerVisibility", {
        detail: { visible: shouldBeVisible }
      });
      window.dispatchEvent(headerVisibilityEvent);
      
      // Update previous position for next comparison
      setPrevScrollPos(currentScrollPos);
    };
    
    // Initial check
    trackScroll();
    
    // Add event listener
    contentArea.addEventListener('scroll', trackScroll);
    
    // Cleanup
    return () => contentArea.removeEventListener('scroll', trackScroll);
  }, [contentRef, onHeaderVisibilityChange, prevScrollPos]);
  
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <div
      className={`fixed right-8 bottom-8 z-40 transition-opacity duration-300 ${
        isButtonVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToTop}
        className="w-12 h-12 rounded-full bg-[#394843] shadow-lg flex items-center justify-center relative"
      >
        {/* Progress indicator */}
        <svg className="w-12 h-12 absolute" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#E5E0D9"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#32C685"
            strokeWidth="8"
            strokeDasharray="283"
            strokeDashoffset={283 - scrollProgress * 283}
            transform="rotate(-90 50 50)"
          />
        </svg>
        {/* Up arrow */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white z-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
    </div>
  );
}

function BuildingSearchPage({ onNavigate, direction = "forward" }) {
  const {
    searchResults,
    criteria,
    setShowResults,
    activeTab,
    setActiveTab,
    visibleSolutions,
    setVisibleSolutions,
    loading,
    getFormattedValue,
  } = useGreenmark();
  // In BuildingSearchPage.jsx, add this state variable at the top
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [detailsSectionHeight, setDetailsSectionHeight] = useState(60);
  const [fullscreenSection, setFullscreenSection] = useState(null);
  const modelContainerRef = useRef(null);

  // Add these near the top of your BuildingSearchPage component
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);


  const contentAreaRef = useRef(null);

   // Define a handler to receive header visibility changes
   const handleHeaderVisibilityChange = (isVisible) => {
    setVisible(isVisible);
  };

    // Update your existing scroll handler to only manage header visibility:
    useEffect(() => {
      const contentArea = contentAreaRef.current;
      if (!contentArea) return;
  
      const handleScroll = () => {
        const scrollTop = contentArea.scrollTop;
        
        // Only handle header visibility 
        const currentScrollPos = scrollTop;
        setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
        setPrevScrollPos(currentScrollPos);
        
        // Dispatch a custom event for the header to listen to
        const headerVisibilityEvent = new CustomEvent("headerVisibility", {
          detail: {
            visible: prevScrollPos > currentScrollPos || currentScrollPos < 10,
          },
        });
        window.dispatchEvent(headerVisibilityEvent);
      };
  
      contentArea.addEventListener("scroll", handleScroll);
      return () => contentArea.removeEventListener("scroll", handleScroll);
    }, [prevScrollPos]);


  // Set showResults to true when entering this page
  useEffect(() => {
    setShowResults(true);
  }, [setShowResults]);

  const toggleUIVisibility = () => {
    setIsUIVisible(!isUIVisible);
  };

  const toggleFullscreen = (section) => {
    if (fullscreenSection === section) {
      setFullscreenSection(null);
    } else {
      setFullscreenSection(section);
    }
  };

  const adjustSectionHeight = (e) => {
    const newHeight = Math.max(20, Math.min(80, parseInt(e.target.value, 10)));
    setDetailsSectionHeight(newHeight);
  };

  const toggleSolutionVisibility = (solutionType) => {
    setVisibleSolutions((prev) => ({
      ...prev,
      [solutionType]: !prev[solutionType],
    }));
  };

  const openPdfModal = () => {
    setShowPdfModal(true);
    setProjectName("");
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
  };

  const handleProjectNameChange = (e) => {
    setProjectName(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleGeneratePdf();
    }
  };

  const handleGeneratePdf = () => {
    if (projectName.trim() === "") return;

    // Create a PDF download link and click it
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute(
      "download",
      `${projectName.replace(/\s+/g, "_")}_GreenmarkReport.pdf`
    );

    const pdfBlob = new Blob(
      [
        '<BuildingReportPDF projectName="' +
          projectName +
          '" buildingData="' +
          JSON.stringify(searchResults[activeTab]) +
          '" criteria="' +
          JSON.stringify(criteria) +
          '" />',
      ],
      { type: "application/pdf" }
    );

    const url = URL.createObjectURL(pdfBlob);
    downloadLink.setAttribute("href", url);

    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    closePdfModal();
  };

  // Helper function to extract the correct display value
  const getDisplayValue = (key, value) => {
    // Hide building_Id field
    if (key === "building_Id") return null;

    // Handle null or undefined values
    if (value === null || value === undefined) {
      return "";
    }

    // Convert value to string to ensure we can work with it
    let stringValue = String(value);

    // For building details keys
    const buildingDetailKeys = [
      "AIR_SIDE_EFFICIENCY",
      "OCCUPANCY_RATE_FOR_EUI",
      "ACMV_TSE__OR__No_of_ticks",
    ];

    if (buildingDetailKeys.includes(key)) {
      const parts = stringValue.split("@");
      for (let part of parts) {
        part = part.trim();
        // Check if the part starts with the criteria.buildingStatus
        if (part.startsWith(criteria.buildingStatus)) {
          const underscoreIndex = part.indexOf("_");
          if (underscoreIndex !== -1) {
            const result = part.substring(underscoreIndex + 1).trim();
            return formatNewLines(result);
          }
        }
      }
    }

    // For the ETTV_OR_RETV key
    if (key === "ETTV_OR_RETV") {
      const parts = stringValue.split("@");
      for (let part of parts) {
        part = part.trim();
        // Check if the part starts with the criteria.ETTV_Criteria
        if (part.startsWith(criteria.ETTV_Criteria)) {
          const underscoreIndex = part.indexOf("_");
          if (underscoreIndex !== -1) {
            const result = part.substring(underscoreIndex + 1).trim();
            return formatNewLines(result);
          }
        }
      }
    }

    // Apply new line formatting to the original value if no conditions match
    return formatNewLines(stringValue);
  };

  // Helper function to convert \n to React line breaks
  const formatNewLines = (text) => {
    if (!text) return text;
    text = text.replace("$", ",");
    // Split by \n and join with React line breaks
    const parts = text.split("\\n");

    if (parts.length === 1) {
      return text; // No \n found, return the original text
    }

    // Return array of text parts with <br /> elements between them
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const getSolutionCategories = () => {
    return [
      {
        id: "eui",
        name: "EUI Solution",
        lowKey: "EUI_Solution_LOW_COST",
        avgKey: "EUI_Solution_AVG_COST",
        highKey: "EUI_Solution_HIGH_COST",
        metricType: "EUI",
      },
      {
        id: "airside",
        name: "Air Side Efficiency Solution",
        lowKey: "Air_Side_Efficiency_Solution_LOW_COST",
        avgKey: "Air_Side_Efficiency_Solution_AVG_COST",
        highKey: "Air_Side_Efficiency_Solution_HIGH_COST",
        metricType: "ASE",
      },
      {
        id: "ettv",
        name: "ETTV Solution",
        lowKey: "ETTV_Solution_LOW_COST",
        avgKey: "ETTV_Solution_AVG_COST",
        highKey: "ETTV_Solution_HIGH_COST",
        metricType: "ETTV",
      },
      {
        id: "acmv",
        name: "ACMV TSE Solutions",
        lowKey: "ACMV_TSE_Solutions_LOW_COST",
        avgKey: "ACMV_TSE_Solutions_AVG_COST",
        highKey: "ACMV_TSE_Solutions_HIGH_COST",
        metricType: "ACMVTSE",
      },
    ];
  };

    // Determine initial and exit animation values based on direction
    const initialX = direction === 'forward' ? '100%' : '-100%';
    const exitX = direction === 'forward' ? '-100%' : '100%';

  if (loading) {
    return <div className="p-8 text-center">Loading building data...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-content building-search-page bg-[#ede7e1]">
      <div className="relative min-h-screen w-full">
        {/* PDF Export Modal */}
        {showPdfModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className="absolute inset-0 bg-black bg-opacity-70"
              onClick={closePdfModal}
            ></div>
            <div className="relative bg-white rounded-lg w-96 shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-[#394843]">
                    Save Project as PDF
                  </h3>
                  <button
                    onClick={closePdfModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="projectName"
                    className="block text-sm font-medium text-[#627E75] mb-2"
                  >
                    Please name your project
                  </label>
                  <input
                    type="text"
                    id="projectName"
                    value={projectName}
                    onChange={handleProjectNameChange}
                    onKeyDown={handleKeyDown}
                    className="w-full p-3 bg-[#394843] text-white border border-[#4D5D57] rounded focus:outline-none focus:ring-2 focus:ring-[#32C685]"
                    placeholder="Enter project name"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={closePdfModal}
                    className="px-4 py-2 bg-gray-200 text-[#627E75] rounded-full font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>

                  {/* Use PDFDownloadLink for better PDF handling */}
                  {projectName.trim() !== "" && searchResults[activeTab] ? (
                    <PDFDownloadLink
                      document={
                        <BuildingReportPDF
                          projectName={projectName}
                          buildingData={searchResults[activeTab]}
                          criteria={criteria}
                        />
                      }
                      fileName={`${projectName.replace(
                        /\s+/g,
                        "_"
                      )}_GreenmarkReport.pdf`}
                      className={`px-4 py-2 bg-[#32C685] text-white rounded-full font-medium hover:bg-[#28A06A] inline-block text-center`}
                      onClick={() => setTimeout(closePdfModal, 100)}
                    >
                      {({ loading }) =>
                        loading ? "Preparing document..." : "Generate PDF"
                      }
                    </PDFDownloadLink>
                  ) : (
                    <button
                      className="px-4 py-2 bg-gray-200 text-[#A4A8A2] rounded-full font-medium cursor-not-allowed"
                      disabled
                    >
                      Generate PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Control Tips */}
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-70 text-[#394843] p-2 rounded z-10">
          <p>Use mouse to rotate the model. Scroll to zoom.</p>
        </div>
        {/* Toggle Button (Always visible) */}
        <button
          onClick={toggleUIVisibility}
          className="absolute top-4 right-4 z-50 bg-white bg-opacity-80 p-2 rounded-full shadow-md"
        >
          {isUIVisible ? (
            <EyeOff className="w-6 h-6 text-[#394843]" />
          ) : (
            <Eye className="w-6 h-6 text-[#394843]" />
          )}
        </button>
           {/* Main Content Layout - Fixed structure */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left side - 3D Model with dynamic positioning */}
        <div
          ref={modelContainerRef}
          className={`lg:w-2/5 h-screen lg:sticky ${
            visible ? "lg:top-16" : "lg:top-0"
          } lg:left-0 transition-all duration-300`}
        >
          <div className="h-full">
            <Canvas camera={{ position: [0, 1, 20], fov: 45 }}>
              <color attach="background" args={["#ECE8E1"]} />
              <ambientLight intensity={0.5} />
              <directionalLight intensity={1.5} position={[1, 2, 3]} />
              <ModelSpin />
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                target={[0, 0, 0]}
              />
              <Stars count={200} fade depth={20} />
            </Canvas>
          </div>
        </div>

         {/* Right side - Content area with dynamic margin-top */}
         {isUIVisible && (
          <div
            ref={contentAreaRef}
            style={{ 
              marginTop: visible ? '4rem' : '0',
              height: visible ? 'calc(100vh - 4rem)' : '100vh'
            }}
            className="lg:w-3/5 p-4 lg:ml-0 overflow-y-auto transition-all duration-300"
          >
            <div className="max-w-3xl mx-auto py-8">
                {/* Fullscreen overlays */}
                {fullscreenSection === "building-details" && (
                  <FullscreenOverlay
                    title="Building Details"
                    onClose={() => toggleFullscreen(null)}
                  >
                    {searchResults[activeTab] && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                        {Object.entries(searchResults[activeTab])
                          .filter(
                            ([key]) =>
                              !key.includes("_LOW_COST") &&
                              !key.includes("_AVG_COST") &&
                              !key.includes("_HIGH_COST") &&
                              key !== "building_Id"
                          )
                          .map(([key, value]) => {
                            const displayValue = getDisplayValue(key, value);
                            if (displayValue === null) return null;

                            return (
                              <div
                                key={key}
                                className="flex border-b border-gray-200 py-2"
                              >
                                <div className="font-medium w-1/2">
                                  {key.replace(/_/g, " ")}:
                                </div>
                                <div className="w-1/2">{displayValue}</div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </FullscreenOverlay>
                )}

                {fullscreenSection === "solutions" && (
                  <FullscreenOverlay
                    title="Solutions & EUI Values"
                    onClose={() => toggleFullscreen(null)}
                  >
                    <div className="space-y-8">
                      {/* Solution category bars with toggleable solutions */}
                      <div className="space-y-12">
                        {getSolutionCategories().map((category) => (
                          <div key={category.id} className="border-t pt-3">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{category.name}</h4>
                              <button
                                onClick={() =>
                                  toggleSolutionVisibility(category.id)
                                }
                                className="px-2 py-1 bg-[#E8F4F0] text-[#32C685] rounded text-xs hover:bg-[#D6EDE7]"
                              >
                                {visibleSolutions[category.id]
                                  ? "Hide Solutions"
                                  : "Show Solutions"}
                              </button>
                            </div>

                            {/* Use MetricBar component */}
                            <MetricBar
                              metricType={category.metricType}
                              options={{
                                showSlider: false,
                                height: "1.5rem",
                                showVerticalMarkers: false,
                                showLabels: false,
                                showTooltips: false,
                              }}
                            />

                            {/* Togglable solutions */}
                            {visibleSolutions[category.id] && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-grow max-h-full">
                                <div className="bg-[#E8F4F0] p-4 rounded-md">
                                  <h5 className="font-medium text-[#28A06A] mb-3">
                                    Low Cost
                                  </h5>
                                  <div>
                                    {getDisplayValue(
                                      category.lowKey,
                                      searchResults[activeTab]?.[
                                        category.lowKey
                                      ]
                                    ) || "N/A"}
                                  </div>
                                </div>

                                <div className="bg-[#FFF9E6] p-4 rounded-md">
                                  <h5 className="font-medium text-[#D9A50D] mb-3">
                                    Average Cost
                                  </h5>
                                  <div>
                                    {getDisplayValue(
                                      category.avgKey,
                                      searchResults[activeTab]?.[
                                        category.avgKey
                                      ]
                                    ) || "N/A"}
                                  </div>
                                </div>

                                <div className="bg-[#FFF0ED] p-4 rounded-md">
                                  <h5 className="font-medium text-[#E06D44] mb-3">
                                    High Cost
                                  </h5>
                                  <div>
                                    {getDisplayValue(
                                      category.highKey,
                                      searchResults[activeTab]?.[
                                        category.highKey
                                      ]
                                    ) || "N/A"}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </FullscreenOverlay>
                )}

                {/* Results Panel */}
                {searchResults.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-serif text-[#394843]">
                          Building Results
                        </h2>
                        <div className="flex space-x-3">
                          {searchResults[activeTab] ? (
                            <button
                              onClick={openPdfModal}
                              className="px-4 py-2 flex items-center bg-[#E8F4F0] text-[#32C685] rounded-full font-medium hover:bg-[#D6EDE7]"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save to PDF
                            </button>
                          ) : null}
                          <button
                            onClick={() => onNavigate("home")}
                            className="px-4 py-2 bg-gray-200 text-[#627E75] rounded-full font-medium hover:bg-gray-300"
                          >
                            Go Home
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tabs for buildings */}
                    <div className="flex border-b border-gray-100 mb-6 overflow-x-auto">
                      {searchResults.map((building, index) => (
                        <button
                          key={`tab-${index}`}
                          className={`px-6 py-3 font-medium whitespace-nowrap ${
                            activeTab === index
                              ? "border-b-2 border-[#32C685] text-[#32C685]"
                              : "text-[#627E75] hover:text-[#394843]"
                          }`}
                          onClick={() => setActiveTab(index)}
                        >
                          Building {index + 1}
                          <span className="ml-2 text-sm">
                            ({building.Targeted_Greenmark_rating || "Unknown"})
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Main content area with details */}
                    {searchResults[activeTab] && (
                      <div className="px-6 pb-6">
                        {/* Section height adjuster */}
                        <div className="mb-4 flex items-center">
                          <label className="text-sm mr-2 text-[#627E75]">
                            Adjust sections:
                          </label>
                          <input
                            type="range"
                            min="20"
                            max="80"
                            value={detailsSectionHeight}
                            onChange={adjustSectionHeight}
                            className="w-32"
                          />
                        </div>

                        {/* Top section - Building details (resizable, scrollable) */}
                        <div
                          className="bg-[#F4F1ED] p-4 rounded-lg mb-4 overflow-y-auto flex flex-col"
                          style={{ height: `${detailsSectionHeight}%` }}
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-serif text-[#394843]">
                              Building Details
                            </h3>
                            <button
                              onClick={() =>
                                toggleFullscreen("building-details")
                              }
                              className="px-3 py-1 bg-[#32C685] text-white rounded-full text-sm hover:bg-[#28A06A]"
                            >
                              Fullscreen
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-grow">
                            {Object.entries(searchResults[activeTab])
                              .filter(
                                ([key]) =>
                                  !key.includes("_LOW_COST") &&
                                  !key.includes("_AVG_COST") &&
                                  !key.includes("_HIGH_COST") &&
                                  key !== "building_Id"
                              )
                              .map(([key, value]) => {
                                const displayValue = getDisplayValue(
                                  key,
                                  value
                                );
                                if (displayValue === null) return null;

                                return (
                                  <div
                                    key={key}
                                    className="flex border-b border-[#E5E0D9] py-2"
                                  >
                                    <div className="font-medium text-[#394843] w-1/2">
                                      {key.replace(/_/g, " ")}:
                                    </div>
                                    <div className="w-1/2 text-[#627E75]">
                                      {displayValue}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Bottom section - Efficiency bars and solutions (resizable, scrollable) */}
                        <div
                          className="bg-[#F4F1ED] p-4 rounded-lg flex-grow overflow-y-auto"
                          style={{
                            height: `${100 - detailsSectionHeight - 10}%`,
                          }}
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-serif text-[#394843]">
                              Building Efficiency Solutions
                            </h3>
                            <button
                              onClick={() => toggleFullscreen("solutions")}
                              className="px-3 py-1 bg-[#32C685] text-white rounded-full text-sm hover:bg-[#28A06A]"
                            >
                              Fullscreen
                            </button>
                          </div>

                          {/* Solution category bars with toggleable solutions */}
                          <div className="space-y-4">
                            {getSolutionCategories().map((category) => (
                              <div
                                key={category.id}
                                className="border-t border-[#E5E0D9] pt-3"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-[#394843]">
                                    {category.name}
                                  </h4>
                                  <button
                                    onClick={() =>
                                      toggleSolutionVisibility(category.id)
                                    }
                                    className="px-2 py-1 bg-[#E8F4F0] text-[#32C685] rounded-full text-xs hover:bg-[#D6EDE7]"
                                  >
                                    {visibleSolutions[category.id]
                                      ? "Hide Solutions"
                                      : "Show Solutions"}
                                  </button>
                                </div>

                                {/* Use MetricBar component */}
                                <MetricBar
                                  metricType={category.metricType}
                                  options={{
                                    showSlider: false,
                                    height: "1.5rem",
                                    showVerticalMarkers: false,
                                    showLabels: true,
                                    showTooltips: true,
                                  }}
                                />

                                {/* Togglable solutions */}
                                {visibleSolutions[category.id] && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 mb-4">
                                    <div className="bg-[#E8F4F0] p-2 rounded-md text-sm">
                                      <h5 className="font-medium text-[#28A06A] mb-1">
                                        Low Cost
                                      </h5>
                                      <div className="overflow-y-auto max-h-32 text-[#627E75]">
                                        {getDisplayValue(
                                          category.lowKey,
                                          searchResults[activeTab][
                                            category.lowKey
                                          ]
                                        ) || "N/A"}
                                      </div>
                                    </div>

                                    <div className="bg-[#FFF9E6] p-2 rounded-md text-sm">
                                      <h5 className="font-medium text-[#D9A50D] mb-1">
                                        Average Cost
                                      </h5>
                                      <div className="overflow-y-auto max-h-32 text-[#627E75]">
                                        {getDisplayValue(
                                          category.avgKey,
                                          searchResults[activeTab][
                                            category.avgKey
                                          ]
                                        ) || "N/A"}
                                      </div>
                                    </div>

                                    <div className="bg-[#FFF0ED] p-2 rounded-md text-sm">
                                      <h5 className="font-medium text-[#E06D44] mb-1">
                                        High Cost
                                      </h5>
                                      <div className="overflow-y-auto max-h-32 text-[#627E75]">
                                        {getDisplayValue(
                                          category.highKey,
                                          searchResults[activeTab][
                                            category.highKey
                                          ]
                                        ) || "N/A"}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-center py-8">
                      <h3 className="text-xl font-bold text-[#394843] mb-2">
                        No buildings found
                      </h3>
                      <p className="text-[#627E75]">
                        No buildings match your selected criteria. Please try
                        different search parameters.
                      </p>
                      <div className="flex justify-center mt-4 space-x-4">
                        <button
                          onClick={() => onNavigate("desired-criteria")}
                          className="px-4 py-2 bg-[#32C685] text-white rounded-full"
                        >
                          Go Back
                        </button>
                        <button
                          onClick={() => onNavigate("home")}
                          className="px-4 py-2 bg-gray-200 text-[#627E75] rounded-full hover:bg-gray-300"
                        >
                          Go Home
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        {/* Replace the old scroll-to-top button with this: */}
        <ScrollToTopButton contentRef={contentAreaRef} />
        </div>
      </div>
    </div>
    </div>
  );
}

// Component for fullscreen overlays
const FullscreenOverlay = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-white z-50 flex flex-col">
    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
      <h2 className="text-2xl font-serif text-[#394843]">{title}</h2>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-[#32C685] text-white rounded-full hover:bg-[#28A06A]"
      >
        Exit Fullscreen
      </button>
    </div>
    <div className="flex-grow overflow-auto p-6">{children}</div>
  </div>
);

// Component that spins the Warehouse model
export function ModelSpin(props) {
  const fanRef = useRef();

  useFrame(() => {
    if (fanRef.current) {
      fanRef.current.rotation.z += 0.005;
    }
  });

  return <Warehouse ref={fanRef} {...props} />;
}

export default BuildingSearchPage;
