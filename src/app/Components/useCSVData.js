// useCSVData.js
import { useState, useEffect } from 'react';
import { csvJSON } from './BuildingTypeData'; // your CSV parsing function

export function useCSVData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch CSV file from your public assets folder.
    fetch('/assets/TommyProjSheet.csv')
      .then((response) => response.text())
      .then((csvText) => {
        const jsonData = csvJSON(csvText); // Convert CSV text into an array of objects
        setData(jsonData);
      })
      .catch((error) => console.error('Error fetching CSV data:', error));
  }, []);

  return data;
}
