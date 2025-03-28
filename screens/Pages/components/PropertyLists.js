import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  TextInput,
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
  Slider,
  Box,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { debounce } from "lodash";
import "react-native-get-random-values";
import Ionicons from "@expo/vector-icons/Ionicons";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { addFavourite } from "../../../store/slices/favourites";
import { setPropertyDetails } from "../../../store/slices/propertyDetails";
import { MaterialIcons } from "@expo/vector-icons";
import config from "../../../config";
import {
  setCities,
  setDeviceLocation,
} from "../../../store/slices/propertyDetails";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCityId } from "../../../store/slices/authSlice";
import RadioGroup from "react-native-radio-buttons-group";
const PropertyCard = memo(({ item, onNavigate }) => {
  const area = item.builtup_area
    ? `${item.builtup_area} sqft`
    : `${item.length_area || 0} x ${item.width_area || 0} sqft`;
  return (
    <Pressable
      bg="white"
      rounded="lg"
      shadow={3}
      overflow="hidden"
      mb={4}
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
                : `https://placehold.co/600x400@3x.png?text=${item?.property_name}`,
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
              borderColor={
                item.property_status === 1
                  ? "green.300"
                  : item.property_status === 0
                  ? "#f7d716"
                  : "blue.300"
              }
              bg={
                item.property_status === 1
                  ? "green.100"
                  : item.property_status === 0
                  ? "#f7d716"
                  : "blue.100"
              }
              px={2}
              py={0.5}
              borderRadius={30}
              justifyContent="center"
            >
              <Ionicons
                name={
                  item.property_status === 1
                    ? "checkmark-circle"
                    : item.property_status === 0
                    ? "time-outline"
                    : "alert-circle"
                }
                size={14}
                color={
                  item.property_status === 1
                    ? "green"
                    : item.property_status === 0
                    ? "black"
                    : "blue"
                }
              />
              <Text
                fontSize="xs"
                color={
                  item.property_status === 1
                    ? "green.600"
                    : item.property_status === 0
                    ? "black"
                    : "blue.600"
                }
                thin
              >
                {item.property_status === 1
                  ? "Verified"
                  : item.property_status === 0
                  ? "Pending"
                  : "In Review"}
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
        mb={1.5}
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
export default function PropertyLists({ route }) {
  const { prevLocation, prevSearch } = route.params || {};
  const dispatch = useDispatch();
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [propertyForOptions, setPropertyForOptions] = useState([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [bhkOptions, setBhkOptions] = useState([]);
  const [possessionOptions, setPossessionOptions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclose();
  const cities = useSelector((state) => state.property.cities, shallowEqual);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSuggestions, setRecentSuggestions] = useState([]);
  const {
    isOpen: isFilterOpen,
    onOpen: onOpenFilter,
    onClose: onCloseFilter,
  } = useDisclose();
  const [userDetails, setUserDetails] = useState(null);
  const [filters, setFilters] = useState({
    property_for: "",
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
    fetchProperties(true, filters, "Hyderabad");
    onCloseFilter();
  };
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
      { id: "None", label: "None", value: "" },
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
  const locationCacheRef = useRef({});
  const fetchProperties = useCallback(
    async (reset = false, appliedFilters = filters, searchedLocation) => {
      setPropertyLoading(true);
      try {
        const [storedDetails, cityId] = await Promise.all([
          AsyncStorage.getItem("userdetails"),
          AsyncStorage.getItem("city_id"),
        ]);
        if (!storedDetails) {
          setPropertyLoading(false);
          return;
        }
        const parsedUserDetails = JSON.parse(storedDetails);
        setUserDetails(parsedUserDetails);
        const cityData = cityId ? JSON.parse(cityId) : null;
        const locationToSearch = (
          searchedLocation ||
          prevSearch ||
          "Hyderabad"
        ).toLowerCase();
        const pageToFetch = reset ? 1 : page;
        if (
          locationCacheRef.current[locationToSearch] &&
          !reset &&
          pageToFetch === 1
        ) {
          setProperties(locationCacheRef.current[locationToSearch]);
          setHasMore(true);
          setPropertyLoading(false);
          return;
        }
        const queryParams = new URLSearchParams({
          searched_location: locationToSearch,
          searched_city: prevLocation?.value || cityData?.value || "Hyderabad",
          searched_property_for: appliedFilters.property_for || "",
          searched_property_sub: appliedFilters.property_type || "",
          searched_occupancy: appliedFilters.possession_status || "",
          searched_min_price: appliedFilters.min_price_range || "",
          searched_max_price: appliedFilters.max_price_range || "",
          page: pageToFetch,
          limit: limit,
        }).toString();
        const response = await fetch(
          `https://api.meetowner.in/listings/getallpropertiesnew?${queryParams}`
        );
        const data = await response.json();
        if (data?.propertiesData?.length > 0) {
          setProperties((prev) =>
            reset ? data.propertiesData : [...prev, ...data.propertiesData]
          );
          setPage(reset ? 2 : page + 1);
          setHasMore(true);
          if (reset || pageToFetch === 1) {
            locationCacheRef.current[locationToSearch] = data.propertiesData;
          }
        } else {
          if (reset) setProperties([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        if (reset) setProperties([]);
        setHasMore(false);
      } finally {
        setPropertyLoading(false);
        if (reset) setRefreshing(false);
      }
    },
    [filters, page, limit, prevSearch, prevLocation]
  );
  const MAX_CACHE_SIZE = 5;
  useEffect(() => {
    loadRecentSuggestions();
  }, []);
  const loadRecentSuggestions = async () => {
    try {
      const cachedSuggestions = await AsyncStorage.getItem("recentSuggestions");
      if (cachedSuggestions) {
        setRecentSuggestions(JSON.parse(cachedSuggestions));
      }
    } catch (error) {
      console.error("Error loading cached suggestions:", error);
    }
  };
  const saveToCache = async (newSuggestion) => {
    try {
      let updatedSuggestions = [newSuggestion, ...recentSuggestions];
      updatedSuggestions = Array.from(
        new Map(updatedSuggestions.map((item) => [item.id, item])).values()
      ).slice(0, MAX_CACHE_SIZE);
      await AsyncStorage.setItem(
        "recentSuggestions",
        JSON.stringify(updatedSuggestions)
      );
      setRecentSuggestions(updatedSuggestions);
    } catch (error) {
      console.error("Error saving suggestions to cache:", error);
    }
  };
  const fetchSuggestions = async (city_id, query) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${config.awsApiUrl}/general/getlocalitiesbycitynamenew?city_id=${city_id}&input=${query}`
      );
      const data = await response.json();
      if (data?.status === "success") {
        const apiSuggestions = (data?.places || []).slice(0, 10);
        setSuggestions([...recentSuggestions, ...apiSuggestions]);
        if (apiSuggestions.length > 0) {
          saveToCache(apiSuggestions[0]);
        }
      } else {
        setSuggestions(recentSuggestions);
      }
    } catch (error) {
      console.error("Error fetching autocomplete suggestions:", error);
      setSuggestions(recentSuggestions);
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
  useEffect(() => {
    setSearchQuery(prevSearch || "");
    if (prevLocation) {
      setSelectedLocation(prevLocation);
    }
    if (prevSearch || prevLocation) {
      fetchProperties(true, filters, prevSearch || "Hyderabad");
    } else {
      fetchProperties(true, filters, "Hyderabad");
    }
  }, [prevSearch, prevLocation, filters]);
  useEffect(() => {
    const interval = setInterval(() => {
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
  const showFilterActionSheet = () => {
    onOpenFilter();
  };
  const loadMoreProperties = () => {
    if (hasMore && !loading) {
      setLimit((prevLimit) => prevLimit + 10);
    }
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
  const handleLocationSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
    if (selectedLocation?.value) {
      await fetchSuggestions(selectedLocation.value, query);
    } else {
      await fetchProperties(true, filters, query);
    }
  };
  const handleCitySelect = (item) => {
    setSelectedLocation(item);
    onClose();
  };
  return (
    <View style={styles.container}>
      <View style={{ width: "100%", position: "relative" }}>
        <HStack justifyContent="space-between" p={2}>
          <TouchableOpacity onPress={onOpen}>
            <View flexDirection="row" gap={2}>
              <Ionicons name="location-outline" size={20} color="red" />
              <Text>
                Choose properties in{" "}
                <Text style={{ color: "blue", fontWeight: "bold" }}>
                  {selectedLocation?.label || selectedLocation || "your City"}
                </Text>
              </Text>
            </View>
          </TouchableOpacity>
        </HStack>
        <View style={styles.searchContainer}>
          <View style={{ flex: 1, position: "relative" }}>
            <TextInput
              placeholder="Search City, Locality, Property, Projects"
              value={searchQuery}
              onChangeText={(text) => {
                handleLocationSearch(text);
              }}
              style={styles.textInput}
            />
            {searchQuery.trim() !== "" && (
              <TouchableOpacity
                onPress={() => {
                  handleLocationSearch("");
                  fetchProperties(false, filters, "Hyderabad");
                }}
                style={styles.cancelIcon}
              >
                <Ionicons name="close-circle" size={22} color="gray.800" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              if (searchQuery.trim()) {
                const searchedLocation = searchQuery.trim();
                fetchProperties(true, filters, searchedLocation);
              } else {
                fetchProperties(false, filters, "Hyderabad");
              }
            }}
          >
            <Ionicons name="search" size={26} color="gray" />
          </TouchableOpacity>
        </View>
        {suggestions.length > 0 ? (
          <View style={[styles.suggestionsList]}>
            <TouchableOpacity
              onPress={() => {
                setSuggestions([]);
                fetchProperties(false, filters, "Hyderabad");
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close-circle" size={22} color="#000" />
            </TouchableOpacity>
            <FlatList
              data={suggestions}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSearchQuery(item?.value || item?.label);
                    setSuggestions([]);
                    setTimeout(() => {
                      fetchProperties(
                        true,
                        filters,
                        item?.value || "Hyderabad"
                      );
                    }, 0);
                  }}
                >
                  <Text style={styles.suggestionText}>{item?.label}</Text>
                </Pressable>
              )}
            />
          </View>
        ) : null}
      </View>
      <HStack py={2} zIndex={1} right={1} justifyContent={"space-between"}>
        <Text ml={3} fontWeight="bold" fontSize={20} color={"#000"}>
          Best Deals
        </Text>
        <TouchableOpacity onPress={showFilterActionSheet}>
          <View
            flexDirection={"row"}
            borderWidth={0.5}
            borderRadius={30}
            bg={"#1D3A76"}
            px={3}
            gap={2}
            py={0.5}
          >
            <Text fontSize={15} fontWeight={"bold"} color={"#fff"}>
              Filter
            </Text>
            <Ionicons name="filter-outline" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </HStack>
      {propertyLoading && (
        <View style={styles.loadingContainer}>
          <Spinner size="lg" color="#1D3A76" />
          <Text style={styles.loadingText}>Loading Properties...</Text>
        </View>
      )}
      {properties ? (
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
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text fontSize={18} fontWeight="bold">
            No Properties Found
          </Text>
        </View>
      )}
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
                bg="#FF6969"
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#1D3A76",
  },
  noDataText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  headerContainer: {
    paddingBottom: 10,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  cancelIcon: {
    position: "absolute",
    right: 3,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  searchContainer: {
    width: "100%",
    height: 60,
    marginTop: 8,
    marginBottom: 0,
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1D3A76",
    borderRadius: 30,
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  cityText: {
    fontSize: 14,
    color: "#fff",
  },
  textInput: {
    height: 50,
    fontSize: 14,
    color: "#333",
    flex: 1,
    backgroundColor: "white",
    paddingLeft: 25,
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
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
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
    maxHeight: 150,
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    position: "absolute",
    top: "100%",
    marginTop: 2,
    left: "5%",
    zIndex: 999,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  suggestionItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1000,
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 3,
  },
  closeIcon: {
    fontSize: 18,
    color: "#000",
  },
});
