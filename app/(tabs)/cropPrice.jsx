import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Path, Line, Text as SvgText, G, Circle } from 'react-native-svg';

// --- THEME ---
const COLORS = {
  primary: "#2E7D32",
  background: "#E8F5E9",
  text: "#1B5E20",
  border: "#C8E6C9",
  white: "#FFFFFF",
  textLight: "#66BB6A",
  card: "#FFFFFF",
  shadow: "#000000",
};

// --- API Configuration ---
const API_KEY = "579b464db66ec23bdd0000017f811c5a638a48ce45f525cf9ab89bd0";
const API_BASE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"; // Corrected Resource ID

// --- Helper Function to parse DD/MM/YYYY dates robustly ---
const parseDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;
  // Expected format: DD/MM/YYYY
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10); // Month is 1-based here
    const year = parseInt(parts[2], 10);

    // Basic validation for parts
    if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1900 && year < 2100) {
      // Month in JS Date is 0-indexed, so month - 1. Use UTC to avoid timezone shifts.
      const date = new Date(Date.UTC(year, month - 1, day));
      
      // Final check to ensure the date is valid (e.g., handles non-existent dates like Feb 30)
      if (date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
        return date;
      }
    }
  }
  // If format is not strictly DD/MM/YYYY, return null to avoid errors.
  return null;
};


// --- Chart Component ---
const YearlyPriceChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <Text style={styles.chartErrorText}>No historical data available for this selection.</Text>;
    }

    const prices = data.map(d => d.avgPrice);
    let minPrice = Math.min(...prices);
    let maxPrice = Math.max(...prices);

    // Handle case with single data point to avoid a flat line or division by zero
    if (minPrice === maxPrice) {
      minPrice = minPrice * 0.9;
      maxPrice = maxPrice * 1.1;
    }

    const width = 340;
    const height = 160;
    const padding = 30;

    const y = (price) => height - padding - ((price - minPrice) / (maxPrice - minPrice || 1)) * (height - 2 * padding);
    const x = (index) => {
        if (data.length <= 1) return width / 2; // Center the single point
        return padding + (index / (data.length - 1)) * (width - 2 * padding);
    }

    const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.avgPrice)}`).join(' ');

    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Last 12 Months Average Price</Text>
            <Svg width={width} height={height}>
                <G y={-10}>
                    {/* Y-Axis Labels */}
                    <SvgText x={padding - 5} y={y(maxPrice) + 4} fill={COLORS.textLight} fontSize="10" textAnchor="end">₹{Math.round(maxPrice)}</SvgText>
                    <SvgText x={padding - 5} y={y(minPrice) + 4} fill={COLORS.textLight} fontSize="10" textAnchor="end">₹{Math.round(minPrice)}</SvgText>
                    
                    {/* Render a line for 2+ points, or a single circle for 1 point */}
                    {data.length > 1 ? (
                        <Path d={path} fill="none" stroke={COLORS.primary} strokeWidth="2.5" />
                    ) : (
                        <Circle cx={x(0)} cy={y(prices[0])} r="4" fill={COLORS.primary} />
                    )}

                    {/* X-Axis Labels (Months) */}
                    {data.map((d, i) => (
                        <SvgText key={i} x={x(i)} y={height - 15} fill={COLORS.textLight} fontSize="10" textAnchor="middle">{d.month}</SvgText>
                    ))}
                </G>
            </Svg>
        </View>
    );
};


const CropPriceFinder = () => {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [commodity, setCommodity] = useState("");
  const [data, setData] = useState([]);
  const [yearlyData, setYearlyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchAndProcessYearlyData = async (state, district, commodity) => {
    let url = `${API_BASE_URL}?api-key=${API_KEY}&format=json&limit=1000`; // Fetch a large batch of data
    if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
    if (district) url += `&filters[district]=${encodeURIComponent(district)}`;
    if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity)}`;
    
    try {
      const response = await fetch(url);
      const json = await response.json();
      const records = json.records || [];

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const today = new Date();

      const monthlyAverages = {};

      records.forEach(rec => {
          const recordDate = parseDate(rec.arrival_date);
          if (
            recordDate &&
            recordDate >= oneYearAgo &&
            recordDate <= today &&
            rec.modal_price &&
            !isNaN(parseFloat(rec.modal_price))
          ) {
              const monthKey = `${recordDate.getFullYear()}-${recordDate.getMonth()}`;
              if(!monthlyAverages[monthKey]) {
                  monthlyAverages[monthKey] = { prices: [], count: 0, date: recordDate };
              }
              monthlyAverages[monthKey].prices.push(parseFloat(rec.modal_price));
              monthlyAverages[monthKey].count++;
          }
      });
      
      const chartData = Object.values(monthlyAverages)
          .map(month => ({
              avgPrice: month.prices.reduce((a, b) => a + b, 0) / month.count,
              month: month.date.toLocaleDateString('en-US', { month: 'short' }),
              date: month.date
          }))
          .sort((a,b) => a.date - b.date); // Sort by date ascending

      setYearlyData(chartData);

    } catch (error) {
        console.error("Failed to fetch yearly data:", error);
        setYearlyData([]); // Set to empty array to show error message
    }
  };


  const fetchData = async () => {
    Keyboard.dismiss(); // Dismiss keyboard on search
    setLoading(true);
    setSearched(true);
    setData([]);
    setYearlyData(null);

    // Fetch yearly data in parallel for the graph
    fetchAndProcessYearlyData(state, district, commodity);
    
    let url = `${API_BASE_URL}?api-key=${API_KEY}&format=json&limit=20`;
    if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
    if (district) url += `&filters[district]=${encodeURIComponent(district)}`;
    if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity)}`;

    try {
      const response = await fetch(url);
      const json = await response.json();
      const today = new Date();
      const sortedRecords = (json.records || [])
        .filter(a => {
          const dateA = parseDate(a.arrival_date);
          return dateA && dateA <= today;
        })
        .sort((a, b) => {
          const dateA = parseDate(a.arrival_date);
          const dateB = parseDate(b.arrival_date);
          // Handle cases where dates might be null
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateB - dateA;
        });
      setData(sortedRecords);
    } catch (error) {
      console.error("Error fetching recent data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setState("");
    setDistrict("");
    setCommodity("");
    setData([]);
    setSearched(false);
    setYearlyData(null);
  };
  
  const TableHeader = () => (
    <View style={styles.tableHeader}>
        <Text style={[styles.headerText, {width: 30}]}>Sl.</Text>
        <Text style={[styles.headerText, {flex: 1.5}]}>Market</Text>
        <Text style={[styles.headerText, {flex: 1.5}]}>Commodity</Text>
        <Text style={[styles.headerText, {flex: 1}]}>Modal</Text>
        <Text style={[styles.headerText, {flex: 1.5}]}>Date</Text>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const recordDate = parseDate(item.arrival_date);
    const formattedDate = recordDate ? recordDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Invalid Date';
    return (
        <View style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlternate]}>
            <Text style={[styles.rowText, {width: 30}]}>{index + 1}</Text>
            <Text style={[styles.rowText, {flex: 1.5}]}>{item.market}</Text>
            <Text style={[styles.rowText, {flex: 1.5}]}>{item.commodity}</Text>
            <Text style={[styles.rowText, {flex: 1, fontWeight: 'bold'}]}>₹{item.modal_price}</Text>
            <Text style={[styles.rowText, {flex: 1.5}]}>{formattedDate}</Text>
        </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Live Crop Prices</Text>
              <Text style={styles.subtitle}>Find the latest Mandi prices across India</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}><Ionicons name="map-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} /><TextInput style={styles.input} placeholder="State (e.g. Andhra Pradesh)" value={state} onChangeText={setState} placeholderTextColor={COLORS.textLight} /></View>
              <View style={styles.inputContainer}><Ionicons name="location-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} /><TextInput style={styles.input} placeholder="District (e.g. Chittor)" value={district} onChangeText={setDistrict} placeholderTextColor={COLORS.textLight}/></View>
              <View style={styles.inputContainer}><Ionicons name="leaf-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Commodity (e.g. Tomato)" value={commodity} onChangeText={setCommodity} placeholderTextColor={COLORS.textLight}/></View>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}><Text style={styles.resetButtonText}>Reset</Text></TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={fetchData}><Text style={styles.buttonText}>Get Prices</Text></TouchableOpacity>
            </View>

            <View style={styles.resultsContainer}>
              {loading && <ActivityIndicator size="large" color={COLORS.primary} style={{marginVertical: 40}} />}
              {!loading && yearlyData && <YearlyPriceChart data={yearlyData} />}
              {!loading && data.length > 0 && (
                <View style={styles.summaryTable}>
                  <Text style={styles.summaryTitle}>Recent 10 Entries</Text>
                  {data.slice(0, 10).map((item, index) => {
                    const recordDate = parseDate(item.arrival_date);
                    const formattedDate = recordDate ? recordDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A';
                    return (
                        <View key={index} style={styles.summaryRow}>
                          <Text style={styles.summaryText}>{formattedDate} - {item.market}</Text>
                          <Text style={[styles.summaryText, {fontWeight: 'bold'}]}>₹{item.modal_price}</Text>
                        </View>
                    );
                  })}
                </View>
              )}
            </View>
            {!loading && data.length > 0 && <TableHeader />}
          </>
        }
        data={loading ? [] : data}
        keyExtractor={(item, index) => `${item.market}-${item.commodity}-${item.arrival_date}-${index}`}
        renderItem={renderItem}
        ListEmptyComponent={
          !loading && searched && data.length === 0 ? (
            <Text style={styles.noResultsText}>No results found. Please try different filters.</Text>
          ) : null
        }
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingVertical: 20, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, },
  subtitle: { fontSize: 16, color: COLORS.textLight, marginTop: 4, },
  formContainer: { marginBottom: 10, paddingHorizontal: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, paddingHorizontal: 10, },
  inputIcon: { marginRight: 10, },
  input: { flex: 1, height: 50, fontSize: 16, color: COLORS.text, },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  button: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center', flex: 2, marginLeft: 10, },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', },
  resetButton: { backgroundColor: COLORS.white, paddingVertical: 15, borderRadius: 12, alignItems: 'center', flex: 1, borderWidth: 1, borderColor: COLORS.border },
  resetButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold', },
  resultsContainer: { marginTop: 20, paddingHorizontal: 20 },
  chartContainer: { alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: 10, marginBottom: 20, },
  chartTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 5, },
  chartErrorText: { color: COLORS.textLight, fontStyle: 'italic', padding: 20, textAlign: 'center' },
  summaryTable: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.text,
  },
  tableHeader: { flexDirection: 'row', backgroundColor: COLORS.card, paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, },
  headerText: { color: COLORS.text, fontWeight: 'bold', fontSize: 12, textAlign: 'center', },
  tableRow: { flexDirection: 'row', backgroundColor: COLORS.white, paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, alignItems: 'center' },
  tableRowAlternate: { backgroundColor: '#F7F9FC', },
  rowText: { color: COLORS.text, fontSize: 12, textAlign: 'center', },
  noResultsText: { textAlign: 'center', marginTop: 30, color: COLORS.textLight, fontSize: 16, paddingHorizontal: 20 }
});

export default CropPriceFinder;

