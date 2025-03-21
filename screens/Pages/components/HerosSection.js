import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
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
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import "react-native-get-random-values";
import { useNavigation } from "@react-navigation/native";
import { useSelector, shallowEqual } from "react-redux";
import { debounce } from "lodash";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_WIDTH = (SCREEN_WIDTH - 48) / 4;
export default function HerosSection({ handleActiveTab }) {
  const [activeTab, setActiveTab] = useState("Buy");
  const tabs = ["Buy", "Rent", "Plot", "Commercial"];
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { isOpen, onOpen, onClose } = useDisclose();
  const cities = useSelector((state) => state.property.cities, shallowEqual);
  const deviceLocation = useSelector(
    (state) => state.property.deviceLocation,
    shallowEqual
  );
  useEffect(() => {
    setLocations(cities);
    setFilteredLocations(cities);
    setSelectedLocation(deviceLocation);
  }, [cities, deviceLocation, activeTab]);
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
  const showLocationActionSheet = () => {
    onOpen();
  };
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
  const navigation = useNavigation();
  const handlePropertiesLists = () => {
    navigation.navigate("PropertyList");
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
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handlePropertiesLists}
            >
              <Ionicons name="search" size={20} color="gray" />
            </TouchableOpacity>
          )}
        />
      </View>
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content
          justifyContent={"center"}
          alignItems={"left"}
          maxHeight={500}
        >
          <Input
            placeholder="Search location"
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
                onPress={() => {
                  setSelectedLocation(item.label);
                  setSearchQuery(item.label);
                  onClose();
                }}
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
            contentContainerStyle={styles.flatListContainer}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
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
    marginRight: 10,
  },
  fullWidthItem: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  fullWidthText: {
    fontSize: 14,
    color: "#333",
  },
  flatListContainer: {
    width: "100%",
    paddingBottom: 20,
  },
});
