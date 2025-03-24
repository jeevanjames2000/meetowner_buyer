import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Icon,
  Input,
  View,
  HStack,
  Text,
  Actionsheet,
  useDisclose,
  FlatList,
  ScrollView,
} from "native-base";
import "react-native-get-random-values";
import { useNavigation } from "@react-navigation/native";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import * as Location from "expo-location";
import { debounce } from "lodash";
import { Ionicons } from "@expo/vector-icons";
import config from "../../../config";
import {
  setCities,
  setDeviceLocation,
} from "../../../store/slices/propertyDetails";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_WIDTH = (SCREEN_WIDTH - 48) / 4;
export default function SearchBox() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Buy");
  const tabs = ["Buy", "Rent", "Plot", "Commercial"];
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { isOpen, onOpen, onClose } = useDisclose();
  const cities = useSelector((state) => state.property.cities, shallowEqual);
  const trending = useSelector((state) => state.property.trendingProjects);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState("");
  const fetchSuggestions = async (city_id, query) => {
    if (!query || !city_id) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${config.awsApiUrl}/general/getlocalitiesbycitynamenew?city_id=${city_id}&input=${query}`
      );
      const data = await response.json();
      if (data?.status === "success") {
        setSuggestions(data?.places || []);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching autocomplete suggestions:", error);
    } finally {
      setLoading(false);
    }
  };
  const debouncedFetchSuggestions = useCallback(
    debounce((city_id, query) => {
      fetchSuggestions(city_id, query);
    }, 300),
    []
  );
  useEffect(() => {
    const fetchCities = async () => {
      try {
        if (cities.length === 0) {
          const response = await fetch(
            "https://api.meetowner.in/general/getcities"
          );
          const data = await response.json();
          dispatch(setCities(data.cities || []));
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
    getUserLocation();
  }, [dispatch, cities.length]);
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        dispatch(setDeviceLocation("Unknown City"));
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
      dispatch(setDeviceLocation("Unknown City"));
    }
  };
  useEffect(() => {
    setLocations(cities);
    setFilteredLocations(cities);
    if (userLocation && cities.length > 0) {
      const matchedCity = cities.find(
        (city) => city.label.toLowerCase() === userLocation.toLowerCase()
      );
      if (matchedCity) {
        setSelectedLocation({
          label: matchedCity.label,
          value: matchedCity.value,
        });
      } else {
        setSelectedLocation(null);
      }
    }
  }, [cities, userLocation]);
  const handleSearch = debounce((query) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter((loc) =>
        loc.label.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, 300);
  const handleLocationSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setSuggestions([]);
      return;
    }
    setSearchQuery(text);
    debouncedFetchSuggestions(selectedLocation?.value, text);
  };
  const handleCitySelect = (item) => {
    setSelectedLocation(item);
    onClose();
  };
  const handlePropertiesLists = () => {
    navigation.navigate("PropertyList", {
      prevSearch: searchQuery,
      prevLocation: selectedLocation,
    });
  };
  const adData = [
    {
      id: 1,
      title: "Meetowner",
      description: "Residential Plot",
      link: "https://via.placeholder.com/160x130?text=No+Image",
    },
    {
      id: 2,
      title: "Ad 2",
      description: "Buy one get one free",
      link: "https://via.placeholder.com/160x130?text=No+Image",
    },
    {
      id: 3,
      title: "Ad 3",
      description: "50% off on new arrivals",
      link: "https://via.placeholder.com/160x130?text=No+Image",
    },
  ];
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (flatListRef.current) {
      const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % adData.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, adData.length]);
  const onScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const totalItems = 2;
    const screenWidth = Dimensions.get("window").width;
    const index = Math.floor(contentOffsetX / screenWidth);
    if (index >= 0 && index < totalItems) {
      setCurrentIndex(index);
    } else {
    }
  };

  const handleFetchLiveLocation = async () => {
    console.log("called");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location access is required to fetch your current location."
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      });
      const { latitude, longitude } = location.coords;
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (geocode.length > 0) {
        const place = geocode[0];
        const city = place?.formattedAddress || "";
        const modifiedCity = city.split(",").slice(1, 4).join(", ").trim();
        console.log("modifiedCity: ", modifiedCity);
        setSearchQuery(modifiedCity);
      } else {
        Alert.alert("Error", "Unable to determine your current location.");
      }
    } catch (error) {
      console.error("Error fetching live location:", error);
      Alert.alert(
        "Error",
        "Failed to fetch your live location. Please try again."
      );
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.currentLocation}>
          <TouchableOpacity
            onPress={handleFetchLiveLocation}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f0f0f0",
              borderRadius: 20,
              padding: 5,
            }}
          >
            <Ionicons name="locate" size={18} color="red" />
            <Text style={{ marginLeft: 5, color: "#333", fontSize: 14 }}>
              Use Current Location
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.cityButton} onPress={onOpen}>
            <HStack space={1} alignItems="center">
              <Ionicons name="location-outline" size={20} color="orange" />
              <Text style={styles.cityText}>
                {selectedLocation?.label || selectedLocation || "Select City"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="gray" />
            </HStack>
          </TouchableOpacity>
          <View style={{ flex: 1, position: "relative" }}>
            <TextInput
              placeholder="Search city, locality, properties"
              value={searchQuery}
              onChangeText={(text) => {
                handleLocationSearch(text);
              }}
              selectTextOnFocus={false}
              style={styles.textInput}
            />
            {searchQuery.trim() !== "" && (
              <TouchableOpacity
                onPress={() => {
                  handleLocationSearch("");
                }}
                style={styles.cancelIcon}
              >
                <Ionicons name="close-circle" size={22} color="gray.400" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handlePropertiesLists}
          >
            <Ionicons name="search" size={26} color="gray" />
          </TouchableOpacity>
        </View>

        <View style={styles.suggestionsContainer}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#999" />
            </View>
          ) : suggestions.length > 0 ? (
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSearchQuery(item?.value || item?.label);
                    setSuggestions([]);
                  }}
                >
                  <Text style={styles.suggestionText}>{item?.label}</Text>
                </TouchableOpacity>
              )}
              nestedScrollEnabled={true}
              style={styles.suggestionsList}
            />
          ) : null}
        </View>

        <View>
          <FlatList
            style={{ padding: 10 }}
            ref={flatListRef}
            data={[
              {
                id: "1",
                title: "Comprehensive Property Listings",
                description:
                  "Explore a wide range of properties tailored to your needs.",
              },
              {
                id: "2",
                title: "Location-Based Search",
                description: "Find properties in your desired area with ease.",
              },
            ]}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 15,
                  marginRight: 10,
                  borderWidth: 0.5,
                  borderColor: "#000",
                }}
              >
                <Text style={{ padding: 10, color: "blue" }}>{item.title}</Text>
                <Text style={{ paddingVertical: 20, padding: 10 }}>
                  {item.description}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="purple"
                  style={styles.icon}
                />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            nestedScrollEnabled={true}
          />
        </View>
        <View style={styles.Tsection}>
          <Text fontSize="md" fontWeight="bold" mb={2}>
            Trending Projects
          </Text>
          <FlatList
            ref={flatListRef}
            data={adData}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.adItem}>
                <Text style={styles.adTitle}>{item.title}</Text>
                <Text style={styles.adDescription}>{item.description}</Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="purple"
                  style={styles.icon}
                />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            nestedScrollEnabled={true}
          />
        </View>
        <TouchableOpacity
          style={styles.exploreOptions}
          onPress={handlePropertiesLists}
        >
          <HStack alignItems="center" px={4} py={1}>
            <Ionicons name="compass-outline" size={20} color="purple.600" />
            <Text color="#1D3A76" ml={2}>
              <Text fontWeight="bold">View all properties</Text>
            </Text>
          </HStack>
        </TouchableOpacity>
      </ScrollView>
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content
          justifyContent="flex-start"
          alignItems="flex-start"
          maxHeight={500}
          width="100%"
        >
          <TextInput
            placeholder="Search city"
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.actionsheetInput}
          />
          <FlatList
            data={filteredLocations}
            keyExtractor={(item, index) => `${item.label}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleCitySelect(item)}
                style={styles.fullWidthItem}
              >
                <Text style={styles.fullWidthText}>{item.label}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", color: "gray" }}>
                No locations found
              </Text>
            }
            contentContainerStyle={{ width: "100%" }}
            style={{ width: "100%" }}
            nestedScrollEnabled={true}
          />
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 8,
    backgroundColor: "#fff",
  },
  suggestionsContainer: {
    position: "relative",
    top: 2,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "90%",
    alignSelf: "center",
    zIndex: 1,
  },
  searchContainer: {
    width: "100%",
    borderWidth: 0.5,
    // marginVertical: 2,
    borderRadius: 30,
    marginBottom: 2,
    borderColor: "#ddd",
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cityButton: {
    paddingHorizontal: 6,
    paddingRight: 2,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: "#f9f9f9",
  },
  cityText: {
    fontSize: 12,
    color: "#333",
  },
  textInput: {
    height: 60,
    fontSize: 14,
    color: "#333",
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 10,
    borderRadius: 30,
  },
  iconButton: {
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: "#f9f9f9",
  },
  currentLocation: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    margin: 5,
  },
  exploreOptions: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderRadius: 30,
  },
  Tsection: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  actionsheetInput: {
    width: "100%",
    height: 50,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    fontSize: 16,
    marginVertical: 8,
  },
  cancelIcon: {
    position: "absolute",
    right: 3,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  fullWidthItem: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  fullWidthText: {
    fontSize: 16,
    color: "#333",
  },
  adItem: {
    width: Dimensions.get("window").width - 40,
    height: 150,
    padding: 20,
    backgroundColor: "#ddd",
    borderRadius: 10,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  adDescription: {
    fontSize: 14,
    color: "gray",
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  suggestionsList: {
    position: "absolute",
    top: 1,
    left: 0,
    right: 0,
    backgroundColor: "white",
    maxHeight: 200,
    width: "100%",
    borderRadius: 8,
    elevation: 5,
    zIndex: 999,
  },
  loaderContainer: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionItem: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },
});
