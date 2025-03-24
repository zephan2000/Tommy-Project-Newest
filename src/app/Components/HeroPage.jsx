// In HeroPage.jsx, modify the function signature and motion div properties

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useGreenmark } from "./GreenmarkContext";

function HeroPage({ onNavigate, direction = "forward" }) {
  const { setCriteria, setStepsCompleted, setSearchResults } = useGreenmark();


  // Function to set default values
  const setDefaultValues = useCallback(() => {
    // Define default criteria
    const defaultCriteria = {
      Types_of_building: "Office Buildings (Large) (GFA ≥ 15$000sqm)",
      Pathway: "PATHWAY 2",
      Does_the_design_have_DCS_OR_DDC_OR_CCS: "No DCS/DDC/CCS",
      buildingStatus: "New",
      ETTV_Criteria: "NRBE01-1",
      currentEUI: 75,
      currentASE: 15,
      currentETTV: 35,
      currentACMVTSE: 4,
    };

    // Set the criteria in context
    setCriteria(defaultCriteria);

    // Mark all steps as completed
    const allStepsCompleted = {};
    for (let i = 1; i <= 9; i++) {
      allStepsCompleted[i] = true;
    }
    setStepsCompleted(allStepsCompleted);

    console.log("🔮 Cheatcode activated! Default values loaded.");
  }, [setCriteria, setStepsCompleted]); // Add dependencies

  // Determine initial and exit animation values based on direction
  const initialX = direction === "forward" ? "100%" : "-100%";
  const exitX = direction === "forward" ? "-100%" : "100%";

    // Add keyboard listener for the cheatcode
    useEffect(() => {
      const handleKeyPress = (e) => {
        if (e.key.toLowerCase() === "v") {
          setDefaultValues();
          onNavigate("building-search");
        }
      };
  
      window.addEventListener("keypress", handleKeyPress);
      return () => window.removeEventListener("keypress", handleKeyPress);
    }, [onNavigate, setDefaultValues]);

  return (
    <div className="page-container">
      <div className="page-content hero-page flex items-center justify-center bg-[#ECE8E1]">
        <div className="hero-content max-w-6xl mx-auto flex flex-col lg:flex-row items-center p-8">
          <div className="hero-text lg:w-1/2 mb-8 lg:mb-0 lg:pr-8">
            <h1 className="text-4xl lg:text-5xl font-serif text-[#394843] mb-6 tracking-wide">
              Greenmark Certification Dashboard
            </h1>
            <p className="text-xl text-[#627E75] mb-12">
              Understand your building&apos;s energy efficiency and get tailored
              solutions in minutes
            </p>
            <button
              className="px-8 py-3 bg-[#32C685] text-white rounded-full font-medium hover:bg-[#28A06A] transition-colors"
              onClick={() => onNavigate("building-design")}
            >
              Try it now!
            </button>
          </div>
          <div className="hero-image lg:w-1/2">
            <div className="product-mockup bg-white rounded-lg shadow-xl p-6 h-80 flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 mx-auto text-[#32C685]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="text-xl font-medium text-[#394843] mt-4">
                  Sustainable Building Solutions
                </h3>
                <p className="text-[#627E75] mt-2">
                  Find the most cost-effective ways to improve your building&apos;s
                  energy performance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden cheatcode hint - only visible in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="fixed bottom-2 right-2 text-xs text-gray-400 opacity-30">
            Press &apos;V&apos; to skip to results
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroPage;
