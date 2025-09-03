// --- Official Government API Configuration ---

// 1. This is your API Key from data.gov.in.
const API_KEY = '579b464db66ec23bdd0000017f811c5a638a48ce45f525cf9ab89bd0';

// 2. This is the official, permanent base URL for the Agmarknet price data.
const API_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

/**
 * Fetches a list of the latest market data records to populate dropdowns.
 * @returns {Promise<any>} A promise that resolves with the JSON data from the API.
 */
export const fetchAllMarketDataForLists = async () => {
  // We fetch the latest 1000 records to build a comprehensive list of available options.
  const url = `${API_BASE_URL}?api-key=${API_KEY}&format=json&limit=1000`;
  console.log(`Fetching data for dropdown lists from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData.records;
  } catch (error) {
    console.error('Official API Fetch Error (for lists):', error);
    throw error;
  }
};


/**
 * Fetches specific market price data from the official data.gov.in API.
 * @param {string} commodity - The name of the commodity (e.g., "Potato").
 * @param {string} stateName - The name of the state (e.g., "Karnataka").
 * @param {string} market - The name of the market or city (e.g., "Bangalore").
 * @returns {Promise<any>} A promise that resolves with the JSON data from the API.
 */
export const fetchMarketPrice = async (commodity, stateName, market) => {
  // Construct the full request URL with the API key and filters.
  // URL encoding is used to handle spaces or special characters in the names.
  const url = `${API_BASE_URL}?api-key=${API_KEY}&filters[state]=${encodeURIComponent(stateName)}&filters[market]=${encodeURIComponent(market)}&filters[commodity]=${encodeURIComponent(commodity)}&format=json`;

  console.log(`Fetching specific price data from: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData.records;
  } catch (error) {
    console.error('Official API Fetch Error (specific price):', error);
    throw error;
  }
};

