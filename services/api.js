// --- API Logic for Official data.gov.in API ---

// 1. This is your API Key from data.gov.in.
const API_KEY = '579b464db66ec23bdd0000017f811c5a638a48ce45f525cf9ab89bd0';

// 2. This is the official, permanent base URL for the Agmarknet price data.
const API_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

/**
 * Fetches market price data from the official data.gov.in API.
 * @param {string} commodity - The name of the commodity.
 * @param {string} stateName - The name of the state.
 * @param {string} market - The name of the market/city.
 * @returns {Promise<Array>} A promise that resolves to an array of price records.
 */
export const fetchMarketPrice = async (commodity, stateName, market) => {
  // Construct the URL as per the official API's format.
  const url = `${API_BASE_URL}?api-key=${API_KEY}&format=json&filters[state]=${encodeURIComponent(stateName)}&filters[market]=${encodeURIComponent(market)}&filters[commodity]=${encodeURIComponent(commodity)}`;
  
  console.log(`Fetching specific price data from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseData = await response.json();
    // The official API nests the results in a 'records' array.
    return responseData.records; 
  } catch (error) {
    console.error('Official API Fetch Error:', error);
    // Re-throw the error so the component can catch it and display a message.
    throw error;
  }
};

