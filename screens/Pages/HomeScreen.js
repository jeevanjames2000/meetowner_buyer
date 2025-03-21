import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { HStack, Icon, Image, FlatList, StatusBar } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import HerosSection from "./components/HerosSection";
import Properties from "./components/Properties";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  setCities,
  setDeviceLocation,
} from "../../store/slices/propertyDetails";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { setCityId } from "../../store/slices/authSlice";

export default function HomeScreen() {
  const dispatch = useDispatch();

  useEffect(() => {
    // AsyncStorage.removeItem("userdetails");
    // AsyncStorage.removeItem("usermobile");
    // AsyncStorage.removeItem("token");
    const fetchCities = async () => {
      try {
        const response = await fetch(
          "https://api.meetowner.in/general/getcities"
        );
        const data = await response.json();
        dispatch(setCities(data.cities || []));
        if (userLocation) {
          const matchedCity = data.cities.find(
            (city) => city.label.toLowerCase() === userLocation.toLowerCase()
          );
          if (matchedCity) {
            await AsyncStorage.setItem("city_id", String(matchedCity.value));
            dispatch(setCityId(matchedCity.value));
          } else {
            console.log("City not found in list");
          }
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
    getUserLocation();
  }, [dispatch, userLocation]);

  const [userLocation, setUserLocation] = useState("");
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        dispatch(setUserLocation("Unknown City"));
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const { latitude, longitude } = location.coords;
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (geocode.length > 0) {
        const city = geocode[0]?.city || "Unknown City";
        setUserLocation(city);
        dispatch(setDeviceLocation(city));
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
      Alert.alert("Error", "Failed to get your location.");
      dispatch(setUserLocation("Unknown City"));
    }
  };
  const [activeTab, setActiveTab] = useState("Sell");
  console.log("activeTab: ", activeTab);
  const handleActiveTab = (tab) => {
    setActiveTab(tab);
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <FlatList
            ListHeaderComponent={
              <HerosSection handleActiveTab={handleActiveTab} />
            }
            data={[]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={null}
            ListFooterComponent={<Properties activeTab={activeTab} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 18,
  },
  logo: {
    width: 120,
    height: 70,
  },
  flatListContainer: {
    paddingHorizontal: 15,
  },
});
