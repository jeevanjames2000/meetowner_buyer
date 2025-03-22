import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
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
} from "native-base";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import "react-native-get-random-values";
import { useNavigation } from "@react-navigation/native";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import * as Location from "expo-location";
import { debounce } from "lodash";
import config from "../../../config";
import {
  setCities,
  setDeviceLocation,
} from "../../../store/slices/propertyDetails";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCityId } from "../../../store/slices/authSlice";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_WIDTH = (SCREEN_WIDTH - 48) / 4;
export default function HerosSection({ handleActiveTab }) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Buy");
  const tabs = ["Buy", "Rent", "Plot", "Commercial"];
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState([]);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { isOpen, onOpen, onClose } = useDisclose();
  const cities = useSelector((state) => state.property.cities, shallowEqual);
  const [suggestions, setSuggestions] = useState([]);
  console.log("suggestions: ", suggestions);
  const [loading, setLoading] = useState(false);
  const fetchSuggestions = async (city_id, query) => {
    console.log("city_id, query: ", city_id, query);
    setLoading(true);
    try {
      const response = await fetch(
        `${config.awsApiUrl}/general/getlocalitiesbycitynamenew?city_id=${city_id}&input=${query}`
      );
      const data = await response.json();
      console.log("data: ", data);
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
  useEffect(() => {
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
            const data = {
              label: matchedCity.label,
              value: matchedCity.value,
            };
            AsyncStorage.setItem("city_id", JSON.stringify(data));
            dispatch(setCityId(data));
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
        console.log("City not found in the list");
        setSelectedLocation(null);
      }
    }
  }, [cities, userLocation]);
  const handleTabPress = (tab, index) => {
    handleActiveTab(tab);
    setActiveTab(tab);
    Animated.spring(animatedValue, {
      toValue: index * (TAB_WIDTH + 2),
      friction: 10,
      tension: 1,
      useNativeDriver: true,
    }).start();
  };
  const translateX = animatedValue.interpolate({
    inputRange: [0, (TAB_WIDTH + 2) * (tabs.length - 1)],
    outputRange: [0, (TAB_WIDTH + 2) * (tabs.length - 1)],
  });
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
  const handleLocationSearch = (query) => {
    console.log("Searching locations for query: ", query);
    setSearchQuery(query);
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
    if (selectedLocation?.value) {
      fetchSuggestions(selectedLocation.value, query);
    } else {
      console.log("No city selected. Cannot fetch suggestions.");
      setSuggestions([]);
    }
  };
  const handleCitySelect = (item) => {
    console.log("item: ", item);
    setSelectedLocation(item);
    onClose();
  };
  const handlePropertiesLists = () => {
    navigation.navigate("PropertyList");
  };
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <HStack
          bg="white"
          rounded="lg"
          overflow="hidden"
          alignItems="center"
          position="relative"
          borderWidth={1}
          borderColor="gray.300"
          space={1}
        >
          <Animated.View
            style={[
              styles.tabHighlight,
              {
                transform: [{ translateX }],
                width: TAB_WIDTH - 2,
              },
            ]}
          />
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabPress(tab, index)}
              style={[
                styles.tab,
                activeTab === tab ? styles.activeTab : styles.inactiveTab,
                { width: TAB_WIDTH },
              ]}
            >
              <Text
                color={activeTab === tab ? "white" : "black"}
                fontSize="xs"
                fontWeight={activeTab === tab ? "bold" : "normal"}
                textAlign="center"
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </HStack>
      </View>
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.cityButton} onPress={onOpen}>
          <HStack space={1} alignItems="center">
            <Ionicons name="location-outline" size={20} color="gray" />
            <Text style={styles.cityText}>
              {selectedLocation?.label || selectedLocation || "Select City"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="gray" />
          </HStack>
        </TouchableOpacity>
        <View style={{ flex: 1, position: "relative" }}>
          <TextInput
            placeholder="Search location"
            value={searchQuery}
            onChangeText={(text) => {
              handleLocationSearch(text);
            }}
            style={styles.textInput}
          />
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handlePropertiesLists}
        >
          <Ionicons name="search" size={20} color="gray" />
        </TouchableOpacity>
      </View>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          width: "90%",
          alignSelf: "center",
          zIndex: 1,
        }}
      >
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
            style={styles.suggestionsList}
          />
        ) : null}
      </View>
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content
          justifyContent={"flex-start"}
          alignItems={"flex-start"}
          maxHeight={500}
          width={"100%"}
        >
          <Input
            placeholder="Search city"
            value={searchQuery}
            onChangeText={handleSearch}
            width="100%"
            my="2"
            borderRadius="20"
            backgroundColor="gray.100"
            py="3"
            px="4"
            InputLeftElement={
              <Icon
                as={<MaterialIcons name="search" />}
                size="5"
                ml="2"
                color="gray.500"
              />
            }
          />
          <FlatList
            data={filteredLocations}
            keyExtractor={(item, index) => `${item.label}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={(item) => handleCitySelect(item)}
                style={styles.fullWidthItem}
              >
                <Text style={styles.fullWidthText}>{item.label}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text textAlign="center" color="gray.500">
                No locations found
              </Text>
            }
            contentContainerStyle={{ width: "100%" }}
            style={{ width: "100%" }}
          />
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: -10,
    gap: 4,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    zIndex: 1,
  },
  tabHighlight: {
    position: "absolute",
    height: "80%",
    backgroundColor: "#1D3A76",
    borderRadius: 8,
    left: 3,
    zIndex: -1,
  },
  searchContainer: {
    width: "100%",
    marginTop: 20,
    borderWidth: 0.5,
    borderRadius: 30,
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
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: "#f9f9f9",
  },
  cityText: {
    fontSize: 14,
    color: "#333",
  },
  textInput: {
    height: 50,
    fontSize: 14,
    color: "#333",
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 10,
    borderRadius: 30,
  },
  iconButton: {
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: "#f9f9f9",
  },
  fullWidthItem: {
    flex: 1,
    width: "10%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  loaderContainer: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionsList: {
    position: "absolute",
    top: 1,
    left: 0,
    right: 0,
    backgroundColor: "white",
    maxHeight: 200,
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },
});
