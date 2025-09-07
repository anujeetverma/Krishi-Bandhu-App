import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';

// --- DEPENDENCIES ---
// This component requires the following packages to be installed in your Expo project:
// npx expo install expo-image-picker
// npx expo install @expo/vector-icons
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

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
  error: "#C53030",
};

// --- API Configuration ---
// Make sure this is the correct public URL for your deployed model.
const API_URL = 'https://drone-plant-counter.onrender.com/disease/detect';

const DiseaseDetectionScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // Function to request permissions and pick an image
  const pickImage = async (fromCamera) => {
    let permissionResult;
    if (fromCamera) {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant permission to access photos to use this feature.");
      return;
    }

    const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
    };

    let pickerResult;
    try {
        if (fromCamera) {
            pickerResult = await ImagePicker.launchCameraAsync(options);
        } else {
            pickerResult = await ImagePicker.launchImageLibraryAsync(options);
        }
        
        if (pickerResult.canceled === false && pickerResult.assets && pickerResult.assets.length > 0) {
          setImageUri(pickerResult.assets[0].uri);
          setPrediction(null); // Clear previous prediction
          setError(null);
        }
    } catch (e) {
        console.error("ImagePicker Error:", e);
        Alert.alert("Error", "Could not select image.");
    }
  };

  // Function to upload the image and get a prediction
  const handleDetectDisease = async () => {
    if (!imageUri) return;

    setLoading(true);
    setError(null);
    setPrediction(null);

    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('image', { uri: imageUri, name: filename, type });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();

      if (result && result.prediction) {
          setPrediction(result.prediction);
      } else {
          setError('Could not understand the response from the server.');
      }
      
    } catch (e) {
      console.error(e);
      setError('Failed to connect to the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
            <Text style={styles.title}>Plant Disease Detection</Text>
            <Text style={styles.subtitle}>Upload a photo of a plant leaf to detect diseases.</Text>
        </View>

        {imageUri ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.retakeButton} onPress={() => pickImage(true)} activeOpacity={0.8}>
              <Text style={styles.retakeButtonText}>Retake Picture</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="leaf-outline" size={80} color={COLORS.border} />
            <Text style={styles.placeholderText}>Your image will appear here</Text>
          </View>
        )}

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={() => pickImage(true)} activeOpacity={0.8}>
             <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
            <Text style={styles.buttonText}>Take Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => pickImage(false)} activeOpacity={0.8}>
            <Ionicons name="image-outline" size={24} color={COLORS.primary} />
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
            style={[styles.detectButton, (!imageUri || loading) && styles.buttonDisabled]} 
            onPress={handleDetectDisease}
            disabled={!imageUri || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.detectButtonText}>Detect Disease</Text>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {prediction && (
            <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Detection Result</Text>
                <Text style={styles.resultText}>{prediction}</Text>
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'center'
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    marginTop: 16,
    color: COLORS.textLight,
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  retakeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.error,
    borderRadius: 16,
    marginTop: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },
  retakeButtonText: {
    color: COLORS.white,
    fontWeight: '500',
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '48%',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  detectButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  detectButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  errorText: {
    marginTop: 20,
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  resultCard: {
      width: '100%',
      backgroundColor: COLORS.white,
      padding: 20,
      borderRadius: 16,
      marginTop: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.primary,
  },
  resultTitle: {
      fontSize: 16,
      color: COLORS.textLight,
      marginBottom: 8,
  },
  resultText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: COLORS.text,
  }
});

export default DiseaseDetectionScreen;
