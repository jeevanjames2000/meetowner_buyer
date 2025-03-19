import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  VStack,
  Icon,
  Input,
  View,
  HStack,
  Text,
  Actionsheet,
  ScrollView,
  useDisclose,
} from "native-base";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import "react-native-get-random-values";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const TAB_WIDTH = (SCREEN_WIDTH - 48) / 4;
export default function HerosSection() {
  const [activeTab, setActiveTab] = useState("Buy");
  const tabs = ["Buy", "Rent", "Plot", "Commercial"];
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { isOpen, onOpen, onClose } = useDisclose();
  useEffect(() => {
    fetchLocations();
  }, []);
  useEffect(() => {
    if (locations.length > 0) {
      getUserLocation();
    }
  }, [locations]);
  const fetchLocations = async () => {
    try {
      const response = await fetch(
        "https://api.meetowner.in/general/getcities"
      );
      const data = await response.json();
      setLocations(data.cities || []);
      setFilteredLocations(data.cities || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      Alert.alert("Error", "Failed to load locations.");
    }
  };
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
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
        setSelectedLocation(city);
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
      Alert.alert("Error", "Failed to get your location.");
    }
  };
  const handleTabPress = (tab, index) => {
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
  const showLocationActionSheet = () => {
    setSearchQuery("");
    setFilteredLocations(locations);
    onOpen();
  };
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter((loc) =>
        loc.label.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  };
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
        <GooglePlacesAutocomplete
          placeholder="Search location"
          onPress={(data, details = null) => {
            if (details && details.geometry) {
              const location = details.formatted_address || data.description;
              setSelectedLocation(location);
              setSearchQuery(location);
            } else {
              setSelectedLocation(data.description);
              setSearchQuery(data.description);
            }
          }}
          query={{
            key: "AIzaSyBaj73FwouBoJro-Zxl2M0c0R14bnHdtFc",
            language: "en",
          }}
          fetchDetails={true}
          textInputProps={{
            value: searchQuery,
            onChangeText: (text) => {
              setSearchQuery(text);
              if (text === "") {
                setSelectedLocation("");
              }
            },
          }}
          styles={{
            container: {
              width: "100%",
            },
            textInputContainer: styles.textInputContainer,
            textInput: styles.textInput,
            listView: {
              backgroundColor: "white",
              borderRadius: 10,
              marginTop: 5,
            },
          }}
          renderLeftButton={() => (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={showLocationActionSheet}
            >
              <HStack space={2}>
                <Ionicons name="location-outline" size={20} color="gray" />
                <Text fontSize={12}>
                  {selectedLocation ? selectedLocation : "City"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="gray" />
              </HStack>
            </TouchableOpacity>
          )}
          renderRightButton={() => (
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search" size={20} color="gray" />
            </TouchableOpacity>
          )}
        />
      </View>

      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content
          style={{
            maxHeight: SCREEN_HEIGHT * 0.5,
            width: "100%",
            borderTopRadius: 20,
            backgroundColor: "white",
          }}
        >
          <Input
            placeholder="Search location"
            value={searchQuery}
            onChangeText={(text) => handleSearch(text)}
            width="90%"
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
          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <VStack space={1} width="100%">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc, index) => (
                  <Actionsheet.Item
                    key={index}
                    onPress={() => {
                      setSelectedLocation(loc.label);
                      setSearchQuery(loc.label);
                      onClose();
                    }}
                  >
                    <Text>{loc.label}</Text>
                  </Actionsheet.Item>
                ))
              ) : (
                <Text textAlign="center" color="gray.500">
                  No locations found
                </Text>
              )}
            </VStack>
          </ScrollView>
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
    borderWidth: 1,
    borderRadius: 30,
    borderColor: "#000",
  },
  textInputContainer: {
    backgroundColor: "white",
    borderRadius: 30,
    paddingLeft: 10,
  },
  textInput: {
    height: 50,
    fontSize: 14,
    color: "gray.700",
    backgroundColor: "white",
    borderRadius: 30,
  },
  iconButton: {
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
