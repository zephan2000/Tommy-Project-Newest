import { Fan } from "./Fan";
import { Warehouse } from "./Warehouse";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Eye, EyeOff } from "lucide-react"; // Using lucide icons for visibility toggles
import { useState, useRef, useEffect } from "react";
import React from "react";
import { csvJSON } from "./BuildingTypeData"; // your CSV parsing function
import { DraggableScroll } from "./DraggableScroll";
import Papa from 'papaparse';

const CsvDataComponent = () => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uniqueValues, setUniqueValues] = useState({
    Types_of_building: [],
    Pathway: [],
    Targeted_Greenmark_rating: [],
    Does_the_design_have_DCS_OR_DDC_OR_CCS: [],
  });
  const [criteria, setCriteria] = useState({
    Types_of_building: "",
    Pathway: "",
    Targeted_Greenmark_rating: "",
    Does_the_design_have_DCS_OR_DDC_OR_CCS: "",
  });
  const [result, setResult] = useState(null);

  // Load and parse CSV data
  useEffect(() => {
    const handleCSVLoad = async () => {
      try {
        const response = await fetch('/assets/TommyProjSheet.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            console.log('CSV Data loaded:', results.data);
            setCsvData(results.data);
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error fetching CSV:', error);
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
        [...new Set(csvData.map(item => item[field]))].filter(Boolean);

      const newUniqueValues = {
        Types_of_building: extractUniqueValues('Types_of_building'),
        Pathway: extractUniqueValues('Pathway'),
        Targeted_Greenmark_rating: extractUniqueValues('Targeted_Greenmark_rating'),
        Does_the_design_have_DCS_OR_DDC_OR_CCS: extractUniqueValues('Does_the_design_have_DCS_OR_DDC_OR_CCS'),
      };

      setUniqueValues(newUniqueValues);

      // Set initial criteria values
      setCriteria({
        Types_of_building: newUniqueValues.Types_of_building[0] || '',
        Pathway: newUniqueValues.Pathway[0] || '',
        Targeted_Greenmark_rating: newUniqueValues.Targeted_Greenmark_rating[0] || '',
        Does_the_design_have_DCS_OR_DDC_OR_CCS: newUniqueValues.Does_the_design_have_DCS_OR_DDC_OR_CCS[0] || '',
      });
    }
  }, [csvData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Dropdown changed: ${name} = ${value}`);
    setCriteria(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault(); // Prevent form submission
    console.log('Search criteria:', criteria);
    
    const found = csvData.find(item =>
      item.Types_of_building === criteria.Types_of_building &&
      item.Pathway === criteria.Pathway &&
      item.Targeted_Greenmark_rating === criteria.Targeted_Greenmark_rating &&
      item.Does_the_design_have_DCS_OR_DDC_OR_CCS === criteria.Does_the_design_have_DCS_OR_DDC_OR_CCS
    );
    
    console.log('Search result:', found);
    setResult(found);
  };

  if (loading) {
    return <div className="p-4 text-lg">Loading CSV data...</div>;
  }

  // Render method (similar to public override void Render())
  return (
    <div className="flex gap-4">
      {/* Search Form Panel */}
      <form onSubmit={handleSearch} className="w-1/2 space-y-4">
        <h2 className="text-xl font-bold mb-4">Search Building Data</h2>

        {Object.entries(uniqueValues).map(([field, options]) => (
          <div key={field} className="flex flex-col">
            <label className="flex flex-col space-y-1">
              <span className="font-medium">
                {field.replace(/_/g, ' ')}:
              </span>
              <select
                name={field}
                value={criteria[field]}
                onChange={handleChange}
                className="p-2 border rounded-md bg-white"
              >
                {options.map((option, idx) => (
                  <option key={`${field}-${idx}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2"
        >
          Search
        </button>
      </form>

      {/* Results Table Panel */}
      {result && (
        <div className="w-1/2">
          <h3 className="text-xl font-bold mb-4">Building Details</h3>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <tbody>
                {Object.entries(result).map(([key, value]) => (
                  <tr key={key} className="border-b last:border-b-0">
                    <td className="p-3 font-medium bg-gray-50">{key.replace(/_/g, ' ')}</td>
                    <td className="p-3">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <directionalLight intensity={2} position={[1, 2, 3]} />
            <ModelSpin />
          </Canvas>
        </div>
  
        {/* Toggle Button (Always visible) */}
        <button
          onClick={toggleUIVisibility}
          className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
        >
          {isUIVisible ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
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
      fanRef.current.rotation.y += 0.005;
    }
  });

  return <Warehouse ref={fanRef} {...props} />;
}




// Custom hook to fetch CSV data and convert it into an array of objects
export function useCSVData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/assets/TommyProjSheet.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const jsonData = csvJSON(csvText);
        setData(jsonData);
      })
      .catch((error) => console.error("Error fetching CSV data:", error));
  }, []);

  return data;
}

// Component to render CSV data as an HTML table
export function ReturnDataArray() {
  const dataArray = useCSVData();

  if (!dataArray) {
    return <div>Loading CSV data...</div>;
  }

  const headers = [
    "BUILDINGID",
    "BUILDINGTYPE",
    "PATHWAY",
    "GOLD",
    "PLAT",
    "SLE",
    "FLOORS",
    "ISSOLARPANEL",
    "PATHWAY 1",
    "Pathway",
    "Targeted_Greenmark_rating",
    "Targeted_Greenmark_rating",
    "Targeted_Greenmark_rating",
    "Types_of_building",
  ];

  return (
    <table
      style={{
        borderCollapse: "collapse",
        width: "100%",
        minWidth: "1200px", // Force table to be wider than the container
      }}
    >
      <thead>
        <tr>
          {headers.map((header, idx) => (
            <th
              key={idx}
              style={{
                border: "1px solid #ccc",
                padding: "8px",
                backgroundColor: "#f2f2f2",
              }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dataArray.map((item, rowIndex) => (
          <tr key={rowIndex}>
            {headers.map((header, colIndex) => (
              <td
                key={colIndex}
                style={{ border: "1px solid #ccc", padding: "8px" }}
              >
                {item[header]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}