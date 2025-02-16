import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const CsvDataComponent = () => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [criteria, setCriteria] = useState({
    Types_of_building: '',
    Pathway: '',
    Targeted_Greenmark_rating: '',
    Does_the_design_have_DCS_OR_DDC_OR_CCS: ''
  });
  const [result, setResult] = useState(null);

  // URL to your CSV file. This could be a local file or an external URL.
  const csvUrl = '/assets/TommyProjSheet.csv';

  useEffect(() => {
    // Use PapaParse to download and parse the CSV file
    Papa.parse(csvUrl, {
      download: true,
      header: true, // Converts CSV rows into objects using the header row for keys
      complete: (results) => {
        console.log('Parsed CSV data:', results.data);
        setCsvData(results.data);
        setLoading(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setLoading(false);
      }
    });
  }, [csvUrl]);

  // Handle input changes for each search field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCriteria(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to find a matching object based on the criteria
  const HandleSearch = () => {
    const found = csvData.find(item => 
      item.Types_of_building === criteria.Types_of_building &&
      item.Pathway === criteria.Pathway &&
      item.Targeted_Greenmark_rating === criteria.Targeted_Greenmark_rating &&
      item.Does_the_design_have_DCS_OR_DDC_OR_CCS === criteria.Does_the_design_have_DCS_OR_DDC_OR_CCS
    );
    setResult(found || null);
  };

  if (loading) {
    return <div>Loading CSV data...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Search CSV Data</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Types_of_building:
          <input 
            type="text"
            name="Types_of_building"
            value={criteria.Types_of_building}
            onChange={handleChange}
            style={{ marginLeft: '10px' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Pathway:
          <input 
            type="text"
            name="Pathway"
            value={criteria.Pathway}
            onChange={handleChange}
            style={{ marginLeft: '10px' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Targeted_Greenmark_rating:
          <input 
            type="text"
            name="Targeted_Greenmark_rating"
            value={criteria.Targeted_Greenmark_rating}
            onChange={handleChange}
            style={{ marginLeft: '10px' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Does_the_design_have_DCS_OR_DDC_OR_CCS:
          <input 
            type="text"
            name="Does_the_design_have_DCS_OR_DDC_OR_CCS"
            value={criteria.Does_the_design_have_DCS_OR_DDC_OR_CCS}
            onChange={handleChange}
            style={{ marginLeft: '10px' }}
          />
        </label>
      </div>
      <button onClick={handleSearch}>Search</button>

      <div style={{ marginTop: '20px' }}>
        {result ? (
          <>
            <h3>Matching Object Found:</h3>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </>
        ) : (
          <p>No matching object found.</p>
        )}
      </div>
    </div>
  );
};

export default CsvDataComponent;
