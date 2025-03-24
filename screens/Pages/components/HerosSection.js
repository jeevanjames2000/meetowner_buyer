import React, { useState, useEffect } from "react";
import {
  StyleSheet,
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
import {
  setCities,
  setDeviceLocation,
} from "../../../store/slices/propertyDetails";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCityId } from "../../../store/slices/authSlice";

export default function HerosSection() {
  const dispatch = useDispatch();
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclose();
  const cities = useSelector((state) => state.property.cities, shallowEqual);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

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
  const handleLocationSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
  };
  const handleCitySelect = (item) => {
    setSelectedLocation(item);
    onClose();
  };
  const handlePropertiesLists = () => {
    navigation.navigate("SearchBox");
  };
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
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
            onPress={handlePropertiesLists}
            selectTextOnFocus={false}
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
    marginTop: 10,
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
    paddingHorizontal: 10,
    paddingRight: 2,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: "#f9f9f9",
  },
  cityText: {
    fontSize: 14,
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
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
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
  fullWidthText: {
    fontSize: 16,
    color: "#333",
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
