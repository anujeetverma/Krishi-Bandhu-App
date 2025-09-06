import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';

// --- DEPENDENCIES ---
// This component requires the following packages to be installed in your Expo project:
// npx expo install expo-location
// npx expo install expo-linear-gradient
// npx expo install react-native-svg
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Line, Circle, Polyline } from 'react-native-svg';


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

// --- Helper Functions ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const getDayAbbreviation = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

const getDayOfMonth = (dateString) => {
    const date = new Date(dateString);
    return date.getDate();
}


const getWeatherDescription = (code) => {
  const descriptions = { 0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Rime Fog', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Dense Drizzle', 61: 'Slight Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Slight Snow', 73: 'Snow', 75: 'Heavy Snow', 80: 'Rain Showers', 81: 'Rain Showers', 82: 'Violent Showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'};
  return descriptions[code] || 'Unknown';
};

const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};


// --- SVG Icons ---
const DetailIcon = ({ type, color }) => {
    const size = 24;
    const icons = {
        humidity: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0L12 2.69z"></Path></Svg>,
        precipitation: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></Path><Line x1="8" y1="18" x2="8" y2="18"></Line><Line x1="12" y1="20" x2="12" y2="20"></Line><Line x1="16" y1="18" x2="16" y2="18"></Line></Svg>,
        pressure: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M21.5 12H19.25a7.5 7.5 0 1 0-15 0H2.5"></Path><Path d="M12 5.5V2.5"></Path><Path d="M12 21.5V18.5"></Path></Svg>,
        wind: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M9.59 4.59A2 2 0 1 1 11 8H2"></Path><Path d="M14.41 19.41A2 2 0 1 0 13 16H2"></Path><Path d="M2 12h17.5"></Path></Svg>,
        sunrise: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M17 18a5 5 0 0 0-10 0"></Path><Line x1="12" y1="2" x2="12" y2="9"></Line><Line x1="4.22" y1="10.22" x2="5.64" y2="8.81"></Line><Line x1="1" y1="18" x2="3" y2="18"></Line><Line x1="21" y1="18" x2="23" y2="18"></Line><Line x1="18.36" y1="8.81" x2="19.78" y2="10.22"></Line><Line x1="23" y1="22" x2="1" y2="22"></Line><Polyline points="8 6 12 2 16 6"></Polyline></Svg>,
        sunset: <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M17 18a5 5 0 0 0-10 0"></Path><Line x1="12" y1="9" x2="12" y2="2"></Line><Line x1="4.22" y1="10.22" x2="5.64" y2="8.81"></Line><Line x1="1" y1="18" x2="3" y2="18"></Line><Line x1="21" y1="18" x2="23" y2="18"></Line><Line x1="18.36" y1="8.81" x2="19.78" y2="10.22"></Line><Line x1="23" y1="22" x2="1" y2="22"></Line><Polyline points="16 5 12 9 8 5"></Polyline></Svg>
    };
    return icons[type] || null;
}

const WeatherIcon = ({ code, size, color }) => {
    const icons = {
        sunny: <Svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Circle cx="12" cy="12" r="5"></Circle><Line x1="12" y1="1" x2="12" y2="3"></Line><Line x1="12" y1="21" x2="12" y2="23"></Line><Line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></Line><Line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></Line><Line x1="1" y1="12" x2="3" y2="12"></Line><Line x1="21" y1="12" x2="23" y2="12"></Line><Line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></Line><Line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></Line></Svg>,
        partlySunny: <Svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M12 2a4.4 4.4 0 0 0-2.4 8.19A6 6 0 0 0 6 20h12a6 6 0 0 0-3.27-5.4"></Path></Svg>,
        cloud: <Svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></Path></Svg>,
        rainy: <Svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></Path></Svg>,
        snow: <Svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></Path></Svg>,
        thunderstorm: <Svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M21 16.65A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></Path><Polyline points="8 16 12 12 12 22 16 18"></Polyline></Svg>,
    };
    let iconKey = 'cloud';
    if (code <= 1) iconKey = 'sunny'; else if (code <= 3) iconKey = 'partlySunny'; else if (code <= 48) iconKey = 'cloud'; else if (code <= 67) iconKey = 'rainy'; else if (code <= 77) iconKey = 'snow'; else if (code <= 82) iconKey = 'rainy'; else if (code <= 99) iconKey = 'thunderstorm';
    return icons[iconKey];
};


// --- The Dashboard Component ---
const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState("Your Location");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied.');
        setLoading(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        let placemark = await Location.reverseGeocodeAsync({latitude, longitude});
        if (placemark && placemark[0] && placemark[0].city) {
            setLocationName(`${placemark[0].city}, ${placemark[0].country}`);
        }

        const WEATHER_API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,wind_speed_10m_max&forecast_days=14&timezone=auto`;

        const response = await fetch(WEATHER_API_URL);
        if (!response.ok) throw new Error('Failed to fetch weather data.');
        const data = await response.json();
        setWeatherData(data);
        setError(null);
      } catch (e) {
        setError('Could not fetch weather data. Check connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching your location & weather...</Text>
        </View>
      );
    }
    if (error) {
      return (
         <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }
    if (weatherData) {
      const { current, daily } = weatherData;
      const selectedDay = {
          temp_max: daily.temperature_2m_max[selectedDayIndex],
          temp_min: daily.temperature_2m_min[selectedDayIndex],
          weather_code: daily.weather_code[selectedDayIndex],
          precipitation: daily.precipitation_sum[selectedDayIndex],
          wind_speed: daily.wind_speed_10m_max[selectedDayIndex],
          sunrise: daily.sunrise[selectedDayIndex],
          sunset: daily.sunset[selectedDayIndex],
      };

      // Note: The Open-Meteo API does not provide daily humidity or pressure,
      // so we will show the current values for those details.
      
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.date}>{formatDate(new Date(daily.time[selectedDayIndex]))}</Text>
          </View>

          

          <LinearGradient
            colors={[COLORS.primary, COLORS.textLight]}
            style={styles.mainCard}
          >
            <View style={styles.mainCardLeft}>
                <Text style={styles.location}>{locationName}</Text>
                <Text style={styles.mainTemp}>{Math.round(selectedDay.temp_max)}°c</Text>
                <Text style={styles.minMaxTemp}>
                    H: {Math.round(selectedDay.temp_max)}° L: {Math.round(selectedDay.temp_min)}°
                </Text>
            </View>
            <View style={styles.mainCardRight}>
                <WeatherIcon code={selectedDay.weather_code} size={80} color={COLORS.white} />
            </View>
          </LinearGradient>
          <View>
            <Text>
              
            </Text>
          </View>

          {/* --- HORIZONTAL FORECAST --- */}
          <View style={styles.forecastContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {daily.time.map((date, index) => (
                <TouchableOpacity 
                  key={date} 
                  style={[styles.forecastItem, selectedDayIndex === index && styles.forecastItemSelected]}
                  onPress={() => setSelectedDayIndex(index)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.forecastText, selectedDayIndex === index && styles.forecastTextSelected]}>{getDayAbbreviation(date)}</Text>
                  <Text style={[styles.forecastDate, selectedDayIndex === index && styles.forecastTextSelected]}>{getDayOfMonth(date)}</Text>
                  <WeatherIcon code={daily.weather_code[index]} size={32} color={selectedDayIndex === index ? COLORS.white : COLORS.text}/>
                  <Text style={[styles.forecastTemp, selectedDayIndex === index && styles.forecastTextSelected]}>{Math.round(daily.temperature_2m_max[index])}°</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <Text style={styles.weatherDescription}>{getWeatherDescription(selectedDay.weather_code)}</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
                <DetailIcon type="humidity" color={COLORS.textLight} />
                <Text style={styles.detailValue}>{current.relative_humidity_2m}%</Text>
                <Text style={styles.detailLabel}>Humidity</Text>
            </View>
            <View style={styles.detailItem}>
                <DetailIcon type="precipitation" color={COLORS.textLight} />
                <Text style={styles.detailValue}>{selectedDay.precipitation} mm</Text>
                <Text style={styles.detailLabel}>Precipitation</Text>
            </View>
            <View style={styles.detailItem}>
                <DetailIcon type="pressure" color={COLORS.textLight} />
                <Text style={styles.detailValue}>{Math.round(current.surface_pressure)} hPa</Text>
                <Text style={styles.detailLabel}>Pressure</Text>
            </View>
             <View style={styles.detailItem}>
                <DetailIcon type="wind" color={COLORS.textLight} />
                <Text style={styles.detailValue}>{Math.round(selectedDay.wind_speed)} km/h</Text>
                <Text style={styles.detailLabel}>Wind</Text>
            </View>
          </View>

          <View style={styles.sunGrid}>
            <View style={styles.sunItem}>
                 <DetailIcon type="sunrise" color={COLORS.text} />
                 <View>
                    <Text style={styles.sunLabel}>Sunrise</Text>
                    <Text style={styles.sunTime}>{formatTime(selectedDay.sunrise)}</Text>
                 </View>
            </View>
            <View style={styles.sunItem}>
                <DetailIcon type="sunset" color={COLORS.text} />
                <View>
                    <Text style={styles.sunLabel}>Sunset</Text>
                    <Text style={styles.sunTime}>{formatTime(selectedDay.sunset)}</Text>
                </View>
            </View>
          </View>
        </ScrollView>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.dashboardWrapper}> 
      <View style={styles.dashboardContainer}>
          {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  dashboardWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  dashboardContainer: {
    flex: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  date: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  forecastContainer: {
    marginBottom: 24,
  },
  forecastItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  forecastItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  forecastText: {
    color: COLORS.text,
    fontSize: 12,
  },
  forecastDate: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  forecastTemp: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  forecastTextSelected: {
    color: COLORS.white,
  },
  mainCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  mainCardLeft: {},
  location: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
    opacity: 0.9,
  },
  mainTemp: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.white,
    lineHeight: 70,
  },
  minMaxTemp: {
    fontSize: 14,
    color: COLORS.white,
    marginTop: 8,
    opacity: 0.9,
  },
  mainCardRight: {},
  weatherDescription: {
      textAlign: 'center',
      marginTop: 16,
      fontSize: 16,
      color: COLORS.text,
      fontWeight: '500'
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  detailItem: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '48%', 
    marginBottom: 16,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  sunGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 0, 
  },
  sunItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      width: '48%',
  },
  sunLabel: {
      fontSize: 14,
      color: COLORS.textLight,
      marginLeft: 12,
      marginBottom: 4,
  },
  sunTime: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.text,
      marginLeft: 12,
  }
});

export default WeatherDashboard;

