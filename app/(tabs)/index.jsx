import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker'; // You may need to install this: npx expo install @react-native-picker/picker

// --- API Logic (Consolidated) ---

const API_KEY = '579b464db66ec23bdd0000017f811c5a638a48ce45f525cf9ab89bd0';
const API_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

// This function now only fetches the final price data.
const fetchMarketPrice = async (commodity, stateName, market) => {
  const url = `${API_BASE_URL}?api-key=${API_KEY}&filters[state]=${encodeURIComponent(stateName)}&filters[market]=${encodeURIComponent(market)}&filters[commodity]=${encodeURIComponent(commodity)}&format=json`;
  console.log(`Fetching specific price data from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const responseData = await response.json();
    return responseData.records;
  } catch (error) {
    console.error('Official API Fetch Error (specific price):', error);
    throw error;
  }
};

// --- Curated Data for Dropdowns ---

const INDIAN_STATES = [
  "Andhra Pradesh", "Karnataka", "Kerala", "Maharashtra", "Punjab",
  "Rajasthan", "Tamil Nadu", "Uttar Pradesh", "West Bengal",
].sort();

const STATE_MARKET_MAP = {
  "Andhra Pradesh": ["Guntur", "Kurnool", "Vijayawada"],
  "Karnataka": ["Bangalore", "Belgaum", "Hubli", "Mysore"],
  "Kerala": ["Kochi", "Thiruvananthapuram", "Thrissur"],
  "Maharashtra": ["Mumbai", "Nagpur", "Nashik", "Pune"],
  "Punjab": ["Amritsar", "Jalandhar", "Ludhiana", "Patiala"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Udaipur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
  "Uttar Pradesh": ["Agra", "Kanpur", "Lucknow", "Varanasi"],
  "West Bengal": ["Asansol", "Kolkata", "Siliguri"],
};

const COMMON_COMMODITIES = [
  "Apple", "Banana", "Brinjal", "Carrot", "Cauliflower", "Cotton",
  "Ginger", "Grapes", "Maize", "Mango", "Onion", "Orange",
  "Paddy(Dhan)(Common)", "Potato", "Rice", "Soyabean", "Sugarcane",
  "Sunflower", "Tomato", "Wheat",
].sort();


// --- Component ---

const COLORS = {
  primary: "#2E7D32",
  background: "#E8F5E9",
  text: "#1B5E20",
  border: "#C8E6C9",
  white: "#FFFFFF",
  textLight: "#66BB6A",
  card: "#FFFFFF",
  primaryDisabled: '#A5D6A7',
};

const MarketPriceScreen = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [data, setData] = useState(null);
  
  const [markets, setMarkets] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selectedCommodity, setSelectedCommodity] = useState(null);

  useEffect(() => {
    if (selectedState && STATE_MARKET_MAP[selectedState]) {
      setMarkets(STATE_MARKET_MAP[selectedState].sort());
    } else {
      setMarkets([]);
    }
    setSelectedMarket(null);
    setSelectedCommodity(null);
  }, [selectedState]);

  const handleFetchPrice = async () => {
    if (!selectedState || !selectedMarket || !selectedCommodity) {
      setApiError('Please make a selection in all dropdowns.');
      return;
    }
    setLoading(true);
    setApiError(null);
    setData(null);
    try {
      const result = await fetchMarketPrice(selectedCommodity, selectedState, selectedMarket);
      setData(result);
    } catch (err) {
      setApiError('Failed to fetch price data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedState(null);
    setSelectedMarket(null);
    setSelectedCommodity(null);
    setData(null);
    setApiError(null);
  };
  
  const renderResults = () => {
    if (!data) return null;
    if (data.length === 0) {
      return (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>No Results Found</Text>
          <Text style={styles.resultText}>No price data was found for this combination. Please try another.</Text>
        </View>
      );
    }
    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Market Prices</Text>
        {data.map((item, index) => (
          <View key={`${item.arrival_date}-${index}`} style={styles.resultCard}>
            <Text style={styles.resultText}><Text style={styles.resultLabel}>Commodity:</Text> {item.commodity}</Text>
            <Text style={styles.resultText}><Text style={styles.resultLabel}>Min Price:</Text> {item.min_price}</Text>
            <Text style={styles.resultText}><Text style={styles.resultLabel}>Max Price:</Text> {item.max_price}</Text>
            <Text style={styles.resultText}><Text style={styles.resultLabel}>Modal Price:</Text> {item.modal_price}</Text>
            <Text style={styles.resultText}><Text style={styles.resultLabel}>Date:</Text> {item.arrival_date}</Text>
          </View>
        ))}
      </View>
    );
  };
  
  const PickerWrapper = ({ children, enabled = true }) => (
    <View style={[styles.pickerContainer, !enabled && styles.pickerDisabled]}>
      {children}
      <Ionicons
        name="chevron-down-outline"
        size={22}
        color={enabled ? COLORS.textLight : COLORS.border}
        style={styles.pickerIcon}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.iconContainer}>
            <Ionicons name="leaf-outline" size={80} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Market Price Finder</Text>
          <Text style={styles.subtitle}>Select from the lists to find prices.</Text>
          
          <View style={styles.formContainer}>
            <PickerWrapper>
              <Picker
                selectedValue={selectedState}
                onValueChange={(itemValue) => setSelectedState(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Select a State..." value={null} />
                {INDIAN_STATES.map(s => <Picker.Item key={s} label={s} value={s} />)}
              </Picker>
            </PickerWrapper>

            <PickerWrapper enabled={!!selectedState}>
              <Picker
                selectedValue={selectedMarket}
                onValueChange={(itemValue) => setSelectedMarket(itemValue)}
                enabled={!!selectedState}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label={selectedState ? "Select a Market..." : "Select a state first"} value={null} />
                {markets.map(m => <Picker.Item key={m} label={m} value={m} />)}
              </Picker>
            </PickerWrapper>

            <PickerWrapper enabled={!!selectedMarket}>
              <Picker
                selectedValue={selectedCommodity}
                onValueChange={(itemValue) => setSelectedCommodity(itemValue)}
                enabled={!!selectedMarket}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label={selectedMarket ? "Select a Commodity..." : "Select a market first"} value={null} />
                {COMMON_COMMODITIES.map(c => <Picker.Item key={c} label={c} value={c} />)}
              </Picker>
            </PickerWrapper>
            
            {apiError && <Text style={styles.errorText}>{apiError}</Text>}
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.clearButton]}
                onPress={handleClear}
                activeOpacity={0.8}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authButton, (loading || !selectedCommodity) && styles.buttonDisabled]}
                onPress={handleFetchPrice}
                disabled={loading || !selectedCommodity}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{loading ? 'Searching...' : 'Find Price'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {loading && <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />}
          {data && renderResults()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, padding: 20 },
  iconContainer: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.textLight, textAlign: 'center', marginBottom: 30 },
  formContainer: { width: '100%' },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    height: 50, // Set a fixed height for consistency
  },
  pickerDisabled: {
    backgroundColor: '#F8F8F8',
  },
  picker: {
    flex: 1,
    color: COLORS.text,
    // On Android, the picker is a modal, so height is less relevant here.
    // On iOS, this allows the text to be vertically centered.
    height: '100%',
    backgroundColor: 'transparent',
  },
  pickerItem: {
    color: COLORS.text, 
    fontSize: Platform.OS === 'ios' ? 20 : 16, // Larger font on iOS for the wheel
  },
  pickerIcon: {
    position: 'absolute',
    right: 10,
    top: 13,
    pointerEvents: 'none', // Allows touch to pass through to the picker
  },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10, fontSize: 14 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  clearButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.primary
  },
  clearButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
  authButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: COLORS.primaryDisabled },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  resultsContainer: { backgroundColor: COLORS.card, borderRadius: 12, padding: 20, marginTop: 30 },
  resultsTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 8 },
  resultCard: { backgroundColor: COLORS.background, borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  resultText: { fontSize: 16, color: COLORS.text, marginBottom: 6, lineHeight: 24 },
  resultLabel: { fontWeight: 'bold', color: COLORS.primary },
});

export default MarketPriceScreen;

