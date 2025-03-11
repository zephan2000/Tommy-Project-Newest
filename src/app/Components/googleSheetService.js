// Function to fetch data from Google Sheets using gid
export const fetchSheetData = async (spreadsheetId, gid) => {
  try {
    // API key from environment variables
    const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    console.log("API Key:", API_KEY ? "Found" : "Not found");
    
    // Use the spreadsheets.values.get endpoint with the gid approach
    // We need to first get the sheet name from the gid
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${API_KEY}`;
    const metadataResponse = await fetch(metadataUrl);
    
    if (!metadataResponse.ok) {
      throw new Error(`Google Sheets API Error: ${metadataResponse.statusText}`);
    }
    
    const metadataData = await metadataResponse.json();
    
    // Find the sheet with the matching gid
    const sheet = metadataData.sheets.find(s => s.properties.sheetId.toString() === gid.toString());
    
    if (!sheet) {
      throw new Error(`Sheet with gid=${gid} not found in the spreadsheet`);
    }
    
    // Get the actual sheet name
    const sheetName = sheet.properties.title;
    
    // Now use the sheet name to get the values
    const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
    console.log("this is url: ", dataUrl);
    
    const dataResponse = await fetch(dataUrl);
    
    if (!dataResponse.ok) {
      throw new Error(`Google Sheets API Error: ${dataResponse.statusText}`);
    }
    
    const data = await dataResponse.json();
    
    // Convert the raw data to a JSON format similar to Papa Parse output
    return convertGoogleSheetsDataToJson(data.values);
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    throw error;  
  }
};

// Helper function to convert Google Sheets API response to JSON with headers
const convertGoogleSheetsDataToJson = (values) => {
  if (!values || values.length === 0) {
    return [];
  }
  
  // First row contains headers
  const headers = values[0];
  
  // Convert remaining rows to objects using the headers as keys
  const rows = values.slice(1).map(row => {
    const item = {};
    headers.forEach((header, index) => {
      // Ensure we don't try to access an undefined element
      item[header] = index < row.length ? row[index] : "";
    });
    return item;
  });
  
  // Return in a format similar to what Papa Parse output
  return rows;
};