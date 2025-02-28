import { Fan } from "./Fan";
import { Warehouse } from "./Warehouse";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Eye, EyeOff } from "lucide-react"; // Using lucide icons for visibility toggles
import { useState, useRef, useEffect } from "react";
import React from "react";
import { csvJSON } from "./BuildingTypeData"; // your CSV parsing function
import { DraggableScroll } from "./DraggableScroll";
import Papa from "papaparse";
import { Stars } from "./Stars";
import { TextureLoader } from "three";
import 'react-resizable/css/styles.css';

function StarsBackground() {
  const starTexture = useLoader(TextureLoader, "/assets/cyberpunkBG.png");
  // The texture will automatically be set as the background for the scene
  return <primitive attach="background" object={starTexture} />;
}


const CsvDataComponent = () => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uniqueValues, setUniqueValues] = useState({
    Types_of_building: [],
    Pathway: [],
    Does_the_design_have_DCS_OR_DDC_OR_CCS: [],
  });
  
  const [criteria, setCriteria] = useState({
    Types_of_building: "",
    Pathway: "",
    Does_the_design_have_DCS_OR_DDC_OR_CCS: "",
    buildingStatus: "new", // new or existing
    targetedEUI: 120, // default value
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [visibleSolutions, setVisibleSolutions] = useState({});
  
  // State for fullscreen section management
  const [fullscreenSection, setFullscreenSection] = useState(null);
  
  // State for section height adjustment
  const [detailsSectionHeight, setDetailsSectionHeight] = useState(60); // percentage

  // Load and parse CSV data
  useEffect(() => {
    const handleCSVLoad = async () => {
      try {
        const response = await fetch("/assets/TommyProjSheet.csv");
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            console.log("CSV Data loaded:", results.data);
            setCsvData(results.data);
            setLoading(false);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
            setLoading(false);
          },
        });
      } catch (error) {
        console.error("Error fetching CSV:", error);
        setLoading(false);
      }
    };

    handleCSVLoad();
  }, []);

  // Process unique values when data loads
  useEffect(() => {
    if (csvData.length > 0) {
      // Extract unique values for each field
      const extractUniqueValues = (field) =>
        [...new Set(csvData.map((item) => item[field]))].filter(Boolean);

      const newUniqueValues = {
        Types_of_building: extractUniqueValues("Types_of_building"),
        Pathway: extractUniqueValues("Pathway"),
        Does_the_design_have_DCS_OR_DDC_OR_CCS: extractUniqueValues(
          "Does_the_design_have_DCS_OR_DDC_OR_CCS"
        ),
      };

      setUniqueValues(newUniqueValues);

      // Set initial criteria values
      setCriteria(prev => ({
        ...prev,
        Types_of_building: newUniqueValues.Types_of_building[0] || "",
        Pathway: newUniqueValues.Pathway[0] || "",
        Does_the_design_have_DCS_OR_DDC_OR_CCS:
          newUniqueValues.Does_the_design_have_DCS_OR_DDC_OR_CCS[0] || "",
      }));
    }
  }, [csvData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Dropdown changed: ${name} = ${value}`);
    setCriteria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSliderChange = (e) => {
    setCriteria((prev) => ({
      ...prev,
      targetedEUI: parseInt(e.target.value, 10),
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search criteria:", criteria);

    // Find all buildings that match the selected criteria regardless of Targeted_Greenmark_rating
    const foundBuildings = csvData.filter(
      (item) =>
        item.Types_of_building === criteria.Types_of_building &&
        item.Pathway === criteria.Pathway &&
        item.Does_the_design_have_DCS_OR_DDC_OR_CCS === criteria.Does_the_design_have_DCS_OR_DDC_OR_CCS
    );

    console.log("Search results:", foundBuildings);
    setSearchResults(foundBuildings);
    setShowResults(true);
    setActiveTab(0); // Reset to first tab
    setVisibleSolutions({}); // Reset visible solutions
  };

  const toggleSolutionVisibility = (solutionType) => {
    setVisibleSolutions(prev => ({
      ...prev,
      [solutionType]: !prev[solutionType]
    }));
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

  const getSolutionCategories = () => {
    return [
      {
        id: "eui",
        name: "EUI Solution",
        lowKey: "EUI_Solution_LOW_COST",
        avgKey: "EUI_Solution_AVG_COST",
        highKey: "EUI_Solution_HIGH_COST"
      },
      {
        id: "airside",
        name: "Air Side Efficiency Solution",
        lowKey: "Air_Side_Efficiency_Solution_LOW_COST",
        avgKey: "Air_Side_Efficiency_Solution_AVG_COST",
        highKey: "Air_Side_Efficiency_Solution_HIGH_COST"
      },
      {
        id: "ettv",
        name: "ETTV Solution",
        lowKey: "ETTV_Solution_LOW_COST",
        avgKey: "ETTV_Solution_AVG_COST",
        highKey: "ETTV_Solution_HIGH_COST"
      },
      {
        id: "acmv",
        name: "ACMV TSE Solutions",
        lowKey: "ACMV_TSE_Solutions_LOW_COST",
        avgKey: "ACMV_TSE_Solutions_AVG_COST",
        highKey: "ACMV_TSE_Solutions_HIGH_COST"
      },
      {
        id: "ventilation",
        name: "Rooms Receiving Natural Ventilation",
        lowKey: "Rooms_Receiving_Natural_Ventilation_in_a_unit_LOW_COST",
        avgKey: "Rooms_Receiving_Natural_Ventilation_in_a_unit_AVG_COST",
        highKey: "Rooms_Receiving_Natural_Ventilation_in_a_unit_HIGH_COST"
      },
      {
        id: "lighting",
        name: "Lighting Solution",
        lowKey: "Lighting_LOW_COST",
        avgKey: "Lighting_AVG_COST",
        highKey: "Lighting_HIGH_COST"
      }
    ];
  };

  if (loading) {
    return <div className="p-4 text-lg">Loading CSV data...</div>;
  }

  // JSX for fullscreen overlays
  const FullscreenOverlay = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Exit Fullscreen
        </button>
      </div>
      <div className="flex-grow overflow-auto p-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {/* Search Form Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6">Building Search</h2>
        
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Building Type */}
            <div className="flex flex-col">
              <label className="font-medium mb-2">Types of building:</label>
              <select
                name="Types_of_building"
                value={criteria.Types_of_building}
                onChange={handleChange}
                className="p-2 border rounded-md bg-white"
              >
                {uniqueValues.Types_of_building.map((option, idx) => (
                  <option key={`building-${idx}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Pathway */}
            <div className="flex flex-col">
              <label className="font-medium mb-2">Pathway:</label>
              <select
                name="Pathway"
                value={criteria.Pathway}
                onChange={handleChange}
                className="p-2 border rounded-md bg-white"
              >
                {uniqueValues.Pathway.map((option, idx) => (
                  <option key={`pathway-${idx}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* DCS/DDC/CCS */}
            <div className="flex flex-col">
              <label className="font-medium mb-2">Does the design have DCS OR DDC OR CCS:</label>
              <select
                name="Does_the_design_have_DCS_OR_DDC_OR_CCS"
                value={criteria.Does_the_design_have_DCS_OR_DDC_OR_CCS}
                onChange={handleChange}
                className="p-2 border rounded-md bg-white"
              >
                {uniqueValues.Does_the_design_have_DCS_OR_DDC_OR_CCS.map((option, idx) => (
                  <option key={`dcs-${idx}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* New/Existing Building */}
            <div className="flex flex-col">
              <label className="font-medium mb-2">Building Status:</label>
              <select
                name="buildingStatus"
                value={criteria.buildingStatus}
                onChange={handleChange}
                className="p-2 border rounded-md bg-white"
              >
                <option value="new">New</option>
                <option value="existing">Existing</option>
              </select>
            </div>
          </div>

          {/* EUI Slider */}
          <div className="mt-6">
            <label className="font-medium block mb-4">Targeted EUI Value: {criteria.targetedEUI}</label>
            <div className="relative">
              <div className="h-2 w-full flex">
                <div className="h-2 flex-1 bg-green-500"></div>
                <div className="h-2 flex-1 bg-yellow-500"></div>
                <div className="h-2 flex-1 bg-red-500"></div>
              </div>
              
              <div className="relative -mt-1">
                <input
                  type="range"
                  min="1"
                  max="999"
                  step="1"
                  value={criteria.targetedEUI}
                  onChange={handleSliderChange}
                  className="w-full h-2 appearance-none bg-transparent cursor-pointer"
                />
                <div className="flex justify-between text-xs mt-1 px-1">
                  <span>115</span>
                  <span>120</span>
                  <span>145</span>
                </div>
                <div className="absolute left-0 w-full flex justify-between text-xs mt-1 px-1">
                  <div className="text-sm font-medium">EUI Values</div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results Panel - Equal height sections layout */}
      {showResults && searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Building Results</h2>
          
          {/* Tabs for buildings */}
          <div className="flex border-b mb-6 overflow-x-auto">
            {searchResults.map((building, index) => (
              <button
                key={`tab-${index}`}
                className={`px-6 py-3 font-medium whitespace-nowrap ${
                  activeTab === index
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(index)}
              >
                Building {index + 1}
                <span className="ml-2 text-sm">
                  ({building.Targeted_Greenmark_rating})
                </span>
              </button>
            ))}
          </div>
          
          {/* Main content area with 3D model and details */}
          {searchResults[activeTab] && (
            <>
              {/* Fullscreen overlays */}
              {fullscreenSection === '3d-model' && (
                <FullscreenOverlay 
                  title="3D Model View" 
                  onClose={() => toggleFullscreen(null)}
                >
                  <div className="h-full flex items-center justify-center bg-black">
                    <SmallModel />
                  </div>
                </FullscreenOverlay>
              )}
              
              {fullscreenSection === 'building-details' && (
                <FullscreenOverlay 
                  title="Building Details" 
                  onClose={() => toggleFullscreen(null)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(searchResults[activeTab])
                      .filter(([key]) => 
                        !key.includes('_LOW_COST') && 
                        !key.includes('_AVG_COST') && 
                        !key.includes('_HIGH_COST')
                      )
                      .map(([key, value]) => (
                        <div key={key} className="flex p-2 border-b">
                          <div className="font-medium w-1/2">
                            {key.replace(/_/g, " ")}:
                          </div>
                          <div className="w-1/2">{value}</div>
                        </div>
                      ))}
                  </div>
                </FullscreenOverlay>
              )}
              
              {fullscreenSection === 'solutions' && (
                <FullscreenOverlay 
                  title="Solutions & EUI Values" 
                  onClose={() => toggleFullscreen(null)}
                >
                  <div className="space-y-8">
                    {/* Main EUI bars */}
                    <div className="mb-8">
                      <h4 className="text-xl font-bold mb-4">EUI Values</h4>
                      <div className="relative">
                        <div className="h-8 w-full flex">
                          <div className="h-8 flex-1 bg-green-500"></div>
                          <div className="h-8 flex-1 bg-yellow-500"></div>
                          <div className="h-8 flex-1 bg-red-500"></div>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>115</span>
                          <span>120</span>
                          <span>145</span>
                        </div>
                      </div>
                    </div>
                    
                    
                    {/* Solution category bars with toggleable solutions */}
                    <div className="space-y-12">
                      {getSolutionCategories().map((category) => (
                        <div key={category.id} className="border-t pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-bold">{category.name}</h4>
                            <button 
                              onClick={() => toggleSolutionVisibility(category.id)}
                              className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              {visibleSolutions[category.id] ? 'Hide Solutions' : 'Show Solutions'}
                            </button>
                          </div>
                          
                          {/* Category bar */}
                          <div className="relative mb-4">
                            <div className="h-8 w-full flex">
                              <div className="h-8 flex-1 bg-green-500"></div>
                              <div className="h-8 flex-1 bg-yellow-500"></div>
                              <div className="h-8 flex-1 bg-red-500"></div>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span>115</span>
                              <span>120</span>
                              <span>145</span>
                            </div>
                          </div>
                          
                          {/* Togglable solutions */}
                          {visibleSolutions[category.id] && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-6">
                              <div className="bg-green-100 p-4 rounded-md">
                                <h5 className="font-medium text-green-800 mb-3">Low Cost</h5>
                                <p>{searchResults[activeTab][category.lowKey] || "N/A"}</p>
                              </div>
                              
                              <div className="bg-yellow-100 p-4 rounded-md">
                                <h5 className="font-medium text-yellow-800 mb-3">Average Cost</h5>
                                <p>{searchResults[activeTab][category.avgKey] || "N/A"}</p>
                              </div>
                              
                              <div className="bg-red-100 p-4 rounded-md">
                                <h5 className="font-medium text-red-800 mb-3">High Cost</h5>
                                <p>{searchResults[activeTab][category.highKey] || "N/A"}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </FullscreenOverlay>
              )}
            
              {/* Regular display (non-fullscreen) */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-screen max-h-screen">
                {/* Left section - 3D Model (2/5 width) - Full height */}
                <div className="lg:col-span-2 bg-black relative flex flex-col">
                  <div className="flex justify-end p-2 bg-gray-800">
                    <button 
                      onClick={() => toggleFullscreen('3d-model')}
                      className="text-white bg-blue-600 px-2 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Fullscreen
                    </button>
                  </div>
                  <div className="flex-grow">
                    <SmallModel />
                  </div>
                </div>
                
                {/* Right section - Building details and bars (3/5 width) */}
                <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
                  {/* Section height adjuster */}
                  <div className="mb-4 flex items-center">
                    <label className="text-sm mr-2">Adjust sections:</label>
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
                    className="bg-gray-100 p-4 rounded-lg mb-4 overflow-y-auto flex flex-col"
                    style={{ height: `${detailsSectionHeight}%` }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">Building Details</h3>
                      <button 
                        onClick={() => toggleFullscreen('building-details')}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Fullscreen
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-grow">
                      {Object.entries(searchResults[activeTab])
                        .filter(([key]) => 
                          !key.includes('_LOW_COST') && 
                          !key.includes('_AVG_COST') && 
                          !key.includes('_HIGH_COST')
                        )
                        .map(([key, value]) => (
                          <div key={key} className="flex border-b border-gray-200 py-2">
                            <div className="font-medium w-1/2">
                              {key.replace(/_/g, " ")}:
                            </div>
                            <div className="w-1/2">{value}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  {/* Bottom section - EUI bars and solutions (resizable, scrollable) */}
                  <div 
                    className="bg-gray-100 p-4 rounded-lg flex-grow overflow-y-auto"
                    style={{ height: `${100 - detailsSectionHeight}%` }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">Building Efficiency Solutions</h3>
                      <button 
                        onClick={() => toggleFullscreen('solutions')}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Fullscreen
                      </button>
                    </div>
                    
                     {/* EUI bars and solutions - same as original */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">EUI Values</h4>
                    <div className="relative">
                      <div className="h-6 w-full flex">
                        <div className="h-6 flex-1 bg-green-500"></div>
                        <div className="h-6 flex-1 bg-yellow-500"></div>
                        <div className="h-6 flex-1 bg-red-500"></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>115</span>
                        <span>120</span>
                        <span>145</span>
                      </div>
                    </div>
                  </div>
                    

                    {/* Solution category bars with toggleable solutions */}
                    <div className="space-y-4">
                      {getSolutionCategories().map((category) => (
                        <div key={category.id} className="border-t pt-3">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{category.name}</h4>
                            <button 
                              onClick={() => toggleSolutionVisibility(category.id)}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                            >
                              {visibleSolutions[category.id] ? 'Hide Solutions' : 'Show Solutions'}
                            </button>
                          </div>
                          
                          {/* Category bar */}
                          <div className="relative mb-2">
                            <div className="h-6 w-full flex">
                              <div className="h-6 flex-1 bg-green-500"></div>
                              <div className="h-6 flex-1 bg-yellow-500"></div>
                              <div className="h-6 flex-1 bg-red-500"></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span>115</span>
                              <span>120</span>
                              <span>145</span>
                            </div>
                          </div>
                          
                          {/* Togglable solutions */}
                          {visibleSolutions[category.id] && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 mb-4">
                              <div className="bg-green-100 p-2 rounded-md text-sm">
                                <h5 className="font-medium text-green-800 mb-1">Low Cost</h5>
                                <p className="overflow-y-auto max-h-32">{searchResults[activeTab][category.lowKey] || "N/A"}</p>
                              </div>
                              
                              <div className="bg-yellow-100 p-2 rounded-md text-sm">
                                <h5 className="font-medium text-yellow-800 mb-1">Average Cost</h5>
                                <p className="overflow-y-auto max-h-32">{searchResults[activeTab][category.avgKey] || "N/A"}</p>
                              </div>
                              
                              <div className="bg-red-100 p-2 rounded-md text-sm">
                                <h5 className="font-medium text-red-800 mb-1">High Cost</h5>
                                <p className="overflow-y-auto max-h-32">{searchResults[activeTab][category.highKey] || "N/A"}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {showResults && searchResults.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <h3 className="text-xl font-bold text-gray-700 mb-2">No buildings found</h3>
            <p className="text-gray-500">
              No buildings match your selected criteria. Please try different search parameters.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvDataComponent;

// Main Scene component
export function SceneProps(props) {
  // State for visibility (similar to public bool IsUIVisible { get; set; })
  const [isUIVisible, setIsUIVisible] = useState(true);

  // Toggle method (similar to private void ToggleUIVisibility())
  const toggleUIVisibility = () => setIsUIVisible(!isUIVisible);

  return (
    <div className="relative h-screen w-full">
      {/* 3D Scene Canvas (Background) */}
      <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 1, 5], fov: 60 }}>
          {/* 2. Set background to black */}
          <color attach="background" args={["#000000"]} />

          {/* 3. Add some lights */}
          <ambientLight intensity={0.3} />
          <directionalLight intensity={2} position={[1, 2, 3]} />

          {/* 4. Grid helper & stars */}
          {/* <gridHelper args={[10, 10]} position={[0, -1, 0]} /> */}
          <Stars count={500} />

          {/* 5. The rotating warehouse model */}
          <ModelSpin />

          {/* 6. OrbitControls for camera rotation */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>

      {/* Toggle Button (Always visible) */}
      <button
        onClick={toggleUIVisibility}
        className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
      >
        {isUIVisible ? (
          <EyeOff className="w-6 h-6" />
        ) : (
          <Eye className="w-6 h-6" />
        )}
      </button>

      {/* Overlay Content (Toggleable) */}
      {isUIVisible && (
        <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-white/90 rounded-lg shadow-lg overflow-auto">
          <div className="p-6">
            <CsvDataComponent />
          </div>
        </div>
      )}
    </div>
  );
}

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

// Main Scene component
export function SmallModel(props) {
  return (
      <Canvas camera={{ position: [0, 1, 5], fov: 60 }}>
          {/* 2. Set background to black */}
          <color attach="background" args={["#000000"]} />

          {/* 3. Add some lights */}
          <ambientLight intensity={0.3} />
          <directionalLight intensity={2} position={[1, 2, 3]} />

          {/* 4. Grid helper & stars */}
          {/* <gridHelper args={[10, 10]} position={[0, -1, 0]} /> */}
          <Stars count={500} />

          {/* 5. The rotating warehouse model */}
          <ModelSpin />

          {/* 6. OrbitControls for camera rotation */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            target={[0, 0, 0]}
          />
        </Canvas>
  );
}