import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import {
  Share,
  RefreshControl,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import {
  FlatList,
  HStack,
  Image,
  Pressable,
  Text,
  View,
  Spinner,
  IconButton,
  Actionsheet,
  useDisclose,
  VStack,
  Input,
  Icon,
  Radio,
  Slider,
  Box,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { debounce } from "lodash";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import "react-native-get-random-values";
import Ionicons from "@expo/vector-icons/Ionicons";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { addFavourite } from "../../../store/slices/favourites";
import { setPropertyDetails } from "../../../store/slices/propertyDetails";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RadioGroup from "react-native-radio-buttons-group";
const PropertyCard = memo(({ item, onNavigate }) => {
  console.log("item: ", item.image);
  const area = item.builtup_area
    ? `${item.builtup_area} sqft`
    : `${item.length_area || 0} x ${item.width_area || 0} sqft`;
  return (
    <Pressable
      bg="white"
      rounded="lg"
      shadow={3}
      overflow="hidden"
      mb={3}
      borderWidth={1}
      borderColor="gray.200"
      onPress={() => onNavigate(item)}
    >
      <HStack space={3} alignItems="flex-start" p={2} py={2}>
        <Image
          source={{
            uri:
              item?.image && item.image.trim() !== ""
                ? `https://api.meetowner.in/uploads/${item.image}`
                : "https://via.placeholder.com/160x130?text=No+Image",
          }}
          alt="Property Image"
          w={160}
          h={130}
          resizeMode="cover"
          rounded="lg"
        />

        <VStack flex={1} space={0.5}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="md" bold color="#1D3A76" numberOfLines={1}>
              {item.property_name || "N/A"}
            </Text>
          </HStack>
          <HStack
            justifyContent={"space-between"}
            space={1}
            alignItems="center"
          >
            <Text fontSize="md" bold color="#FBAF01">
              ₹ {formatToIndianCurrency(item.property_cost || 0)}
            </Text>
            <HStack
              space={1}
              alignItems="center"
              borderWidth={0.5}
              borderColor="green.300"
              bg="green.100"
              px={2}
              py={1}
              borderRadius={30}
              justifyContent="center"
            >
              <Ionicons name="checkmark-circle" size={14} color="green" />
              <Text fontSize="xs" color="green.600" bold>
                Verified
              </Text>
            </HStack>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {item.property_in || "N/A"} | {item.property_subtype || "N/A"}
          </Text>
          {item.facing && (
            <Text fontSize="xs" color="gray.500">
              Facing: {item.facing}
            </Text>
          )}
          <Text fontSize="xs" color="gray.500">
            Area: {area}
          </Text>
          <Text fontSize="xs" color="gray.500" numberOfLines={1}>
            Location: {item.google_address || "N/A"}
          </Text>
        </VStack>
      </HStack>
      <HStack
        justifyContent="space-between"
        space={2}
        py={1.5}
        px={2}
        bg="gray.50"
      >
        <Pressable
          flex={1}
          bg="#1D3A76"
          py={1.5}
          rounded="lg"
          alignItems="center"
          onPress={() => onNavigate(item)}
        >
          <Text color="white" fontSize="xs" bold>
            Schedule Visit
          </Text>
        </Pressable>
        <Pressable
          flex={1}
          bg="#1D3A76"
          py={1.5}
          rounded="lg"
          alignItems="center"
          onPress={() => onNavigate(item)}
        >
          <Text color="white" fontSize="xs" bold>
            Contact Seller
          </Text>
        </Pressable>
        <Pressable
          flex={1}
          bg="#1D3A76"
          py={1.5}
          rounded="lg"
          alignItems="center"
          onPress={() => onNavigate(item)}
        >
          <Text color="white" fontSize="xs" bold>
            Interest
          </Text>
        </Pressable>
      </HStack>
    </Pressable>
  );
});
const formatToIndianCurrency = (value) => {
  if (value >= 10000000) return (value / 10000000).toFixed(2) + " Cr";
  if (value >= 100000) return (value / 100000).toFixed(2) + " L";
  if (value >= 1000) return (value / 1000).toFixed(2) + " K";
  return value.toString();
};
export default function PropertyLists() {
  const dispatch = useDispatch();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const {
    isOpen: isLocationOpen,
    onOpen: onOpenLocation,
    onClose: onCloseLocation,
  } = useDisclose();
  const {
    isOpen: isFilterOpen,
    onOpen: onOpenFilter,
    onClose: onCloseFilter,
  } = useDisclose();
  const [userDetails, setUserDetails] = useState(null);
  const [filters, setFilters] = useState({
    property_for: "Sell",
    property_type: "",
    bedrooms: "",
    possession_status: "",
    min_price_range: 1000,
    max_price_range: 30000000,
  });
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const applyFilters = () => {
    setPage(1);
    fetchProperties(true, filters);
    onCloseFilter();
  };
  const [page, setPage] = useState(1);
  const [location, setLocation] = useState("");
  const [limit, setLimit] = useState(10);
  const [propertyForOptions, setPropertyForOptions] = useState([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [bhkOptions, setBhkOptions] = useState([]);
  const [possessionOptions, setPossessionOptions] = useState([]);
  const clearAllFilters = () => {
    setFilters({
      property_for: "Sell",
      property_type: "",
      bedrooms: "",
      possession_status: "",
      min_price_range: 1000,
      max_price_range: 30000000,
    });
    setPage(1);
    setLimit(50);
    fetchProperties(true, {
      property_for: "Sell",
      property_type: "",
      bedrooms: "",
      possession_status: "",
      min_price_range: 1000,
      max_price_range: 30000000,
    });
  };

  useEffect(() => {
    setPropertyForOptions([
      { id: "Buy", label: "Buy", value: "Sell" },
      { id: "Rent", label: "Rent", value: "Rent" },
    ]);
    setPropertyTypeOptions(
      [
        "Apartment",
        "Independent House",
        "Independent Villa",
        "Plot",
        "Land",
        "Office",
        "Retail Shop",
        "Show Room",
        "Others",
      ].map((type) => ({
        id: type,
        label: type,
        value: type,
      }))
    );
    setBhkOptions(
      [
        "1 BHK",
        "2 BHK",
        "3 BHK",
        "4 BHK",
        "5 BHK",
        "6 BHK",
        "7 BHK",
        "8 BHK",
      ].map((bhk) => ({
        id: bhk,
        label: bhk,
        value: bhk,
      }))
    );
    setPossessionOptions([
      { id: "Ready to Move", label: "Ready to Move", value: "Ready to Move" },
      {
        id: "Under Construction",
        label: "Under Construction",
        value: "Under Construction",
      },
    ]);
  }, []);
  const fetchProperties = useCallback(
    async (reset = false, appliedFilters = filters) => {
      const storedDetails = await AsyncStorage.getItem("userdetails");
      if (!storedDetails) {
        return;
      }
      const parsedUserDetails = JSON.parse(storedDetails);
      setUserDetails(parsedUserDetails);
      try {
        const cityId = await AsyncStorage.getItem("city_id");
        const response = await fetch(
          `https://api.meetowner.in/listings/getallpropertiesnew?searched_location=${location}&searched_city=${
            cityId ? parseInt(cityId, 10) : ""
          }&searched_property_for=${
            appliedFilters.property_for
          }&searched_property_sub=${
            appliedFilters.property_type
          }&searched_occupancy=${
            appliedFilters.possession_status
          }&searched_min_price=${
            appliedFilters.min_price_range
          }&searched_max_price=${appliedFilters.max_price_range}&page=${
            reset ? 1 : page
          }&limit=${limit}`
        );
        const data = await response.json();
        if (data.propertiesData && data.propertiesData.length > 0) {
          setProperties((prev) =>
            reset ? data.propertiesData : [...prev, ...data.propertiesData]
          );
          setPage(reset ? 2 : page + 1);
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.log("Error fetching properties:", error.message);
        setProperties([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        if (reset) setRefreshing(false);
      }
    },
    [filters, location, page, limit]
  );
  useEffect(() => {
    fetchProperties(true, filters);
  }, [filters]);
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refreshing after 2 minutes...");
      onRefresh();
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  const handleFavourites = useCallback((item) => {
    dispatch(addFavourite(item));
  }, []);
  const handleNavigate = useCallback(
    (item) => {
      dispatch(setPropertyDetails(item));
      navigation.navigate("PropertyDetails");
    },
    [navigation]
  );
  const renderPropertyCard = useCallback(
    ({ item }) => (
      <PropertyCard
        item={item}
        onPress={() => handleNavigate(item)}
        onFav={() => handleFavourites(item)}
        onNavigate={() => handleNavigate(item)}
      />
    ),
    [handleFavourites, handleNavigate]
  );
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 100 && !showScrollToTop) {
      setShowScrollToTop(true);
    } else if (offsetY <= 0 && showScrollToTop) {
      setShowScrollToTop(false);
    }
  };
  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      setShowScrollToTop(false);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchProperties(true);
  };
  const windowHeight = Dimensions.get("window").height;
  const itemHeight = 180 + 60 + 40;
  const windowSize = Math.ceil(windowHeight / itemHeight) * 2;
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const cities = useSelector((state) => state.property.cities, shallowEqual);
  const deviceLocation = useSelector(
    (state) => state.property.deviceLocation,
    shallowEqual
  );
  useEffect(() => {
    setLocations(cities);
    setFilteredLocations(cities);
    setSelectedLocation(deviceLocation);
  }, [cities, deviceLocation]);
  const showLocationActionSheet = () => {
    onOpenLocation();
  };
  const showFilterActionSheet = () => {
    onOpenFilter();
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
  const loadMoreProperties = () => {
    if (hasMore && !loading) {
      setLimit((prevLimit) => prevLimit + 10);
    }
  };

  return (
    <View flex={1} px={2} bg={"#fff"}>
      <HStack py={2} mx={1} alignItems={"center"} justifyContent={"center"}>
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
              borderColor: "#000",
              borderWidth: 0.5,
              borderRadius: 30,
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
      </HStack>
      <HStack
        py={2}
        mx={2}
        position={"absolute"}
        bottom={4}
        zIndex={1}
        right={2}
        justifyContent={"flex-end"}
      >
        <TouchableOpacity onPress={showFilterActionSheet}>
          <View
            flexDirection={"row"}
            borderWidth={0.5}
            borderRadius={30}
            bg={"#1D3A76"}
            px={3}
            gap={2}
            py={1}
          >
            <Text fontSize={15} fontWeight={"bold"} color={"#fff"}>
              Filter
            </Text>
            <Ionicons name="filter-outline" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </HStack>
      <FlatList
        ref={flatListRef}
        data={properties}
        keyExtractor={(item, index) => `${item.unique_property_id}-${index}`}
        renderItem={renderPropertyCard}
        onEndReached={loadMoreProperties}
        onEndReachedThreshold={0.1}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        ListFooterComponent={
          loading && hasMore ? <Spinner size="lg" mt={5} /> : null
        }
      />

      {showScrollToTop && (
        <IconButton
          position="absolute"
          bottom={85}
          right={5}
          bg="white"
          borderRadius="full"
          shadow={3}
          icon={<Ionicons name="arrow-up" size={24} color="#1D3A76" />}
          onPress={scrollToTop}
        />
      )}
      <Actionsheet isOpen={isLocationOpen} onClose={onCloseLocation}>
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
                  onCloseLocation();
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
          />
        </Actionsheet.Content>
      </Actionsheet>
      <Actionsheet isOpen={isFilterOpen} onClose={onCloseFilter}>
        <Actionsheet.Content maxHeight={500}>
          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <VStack space={4} width="100%" p={4}>
              <Text fontSize="md" bold>
                Property For
              </Text>
              <Box alignItems="flex-start" width="100%">
                <RadioGroup
                  radioButtons={propertyForOptions}
                  onPress={(value) => handleFilterChange("property_for", value)}
                  selectedId={filters.property_for}
                  containerStyle={{ alignItems: "flex-start", width: "100%" }}
                />
              </Box>
              <Text fontSize="md" bold>
                Property Type
              </Text>
              <Box alignItems="flex-start" width="100%">
                <RadioGroup
                  radioButtons={propertyTypeOptions}
                  onPress={(value) =>
                    handleFilterChange("property_type", value)
                  }
                  selectedId={filters.property_type}
                  containerStyle={{ alignItems: "flex-start", width: "100%" }}
                />
              </Box>
              <Text fontSize="md" bold>
                BHK
              </Text>
              <Box alignItems="flex-start" width="100%">
                <RadioGroup
                  radioButtons={bhkOptions}
                  onPress={(value) => handleFilterChange("bedrooms", value)}
                  selectedId={filters.bedrooms}
                  containerStyle={{ alignItems: "flex-start", width: "100%" }}
                />
              </Box>
              <Text fontSize="md" bold>
                Possession Status
              </Text>
              <Box alignItems="flex-start" width="100%">
                <RadioGroup
                  radioButtons={possessionOptions}
                  onPress={(value) =>
                    handleFilterChange("possession_status", value)
                  }
                  selectedId={filters.possession_status}
                  containerStyle={{ alignItems: "flex-start", width: "100%" }}
                />
              </Box>
              <Text fontSize="md" bold>
                Price Range
              </Text>
              <Box>
                <Text>
                  ₹{filters.min_price_range.toLocaleString()} - ₹
                  {filters.max_price_range.toLocaleString()}
                </Text>
                <Slider
                  defaultValue={parseInt(filters.min_price_range) || 1000}
                  minValue={1000}
                  maxValue={30000000}
                  step={1000}
                  onChange={(value) => {
                    handleFilterChange("min_price_range", value.toString());
                  }}
                >
                  <Slider.Track>
                    <Slider.FilledTrack />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider>
              </Box>
              <Pressable
                onPress={clearAllFilters}
                bg="#FF4D4D"
                py={2}
                rounded="lg"
                alignItems="center"
              >
                <Text color="white" fontSize="md" bold>
                  Clear All
                </Text>
              </Pressable>

              <Pressable
                onPress={applyFilters}
                bg="#1D3A76"
                py={2}
                rounded="lg"
                alignItems="center"
              >
                <Text color="white" fontSize="md" bold>
                  Apply Filters
                </Text>
              </Pressable>
            </VStack>
          </ScrollView>
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  );
}
const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: 10,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  iconButton: {
    padding: 8,
    marginTop: 10,
    marginRight: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  searchContainer: {
    width: "100%",
    marginTop: 10,
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
  searchIconButton: {
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
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
