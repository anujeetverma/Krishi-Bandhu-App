import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";

const API_KEY = "579b464db66ec23bdd0000017f811c5a638a48ce45f525cf9ab89bd0";
const API_BASE_URL =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

export default function AgmarknetPrices() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [commodity, setCommodity] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    let url = `${API_BASE_URL}?api-key=${API_KEY}&format=json&limit=10`;

    if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
    if (district) url += `&filters[district]=${encodeURIComponent(district)}`;
    if (commodity)
      url += `&filters[commodity]=${encodeURIComponent(commodity)}`;

    try {
      const response = await fetch(url);
      const json = await response.json();
      setData(json.records || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agmarknet Daily Prices</Text>

      <TextInput
        style={styles.input}
        placeholder="State (e.g. Andhra Pradesh)"
        value={state}
        onChangeText={setState}
      />
      <TextInput
        style={styles.input}
        placeholder="District (e.g. Chittor)"
        value={district}
        onChangeText={setDistrict}
      />
      <TextInput
        style={styles.input}
        placeholder="Commodity (e.g. Tomato)"
        value={commodity}
        onChangeText={setCommodity}
      />

      <Button title="Get Prices" onPress={fetchData} />

      {loading && <Text>Loading...</Text>}

      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.record}>
            <Text>
              {item.commodity} in {item.market}, {item.district}, {item.state}
            </Text>
            <Text>
              Min: ₹{item.min_price} | Max: ₹{item.max_price} | Modal: ₹
              {item.modal_price}
            </Text>
            <Text>Variety: {item.variety} | Date: {item.arrival_date}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  record: { marginBottom: 15, padding: 10, backgroundColor: "#f2f2f2", borderRadius: 5 },
});